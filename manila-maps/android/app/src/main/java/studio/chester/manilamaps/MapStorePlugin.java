package studio.chester.manilamaps;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.res.AssetManager;
import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Iterator;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import org.json.JSONObject;

/**
 * Keeps the offline map bundle in the app's permanent files directory
 * (filesDir/maps/current.mmap). This is internal app storage, not cache:
 * "Clear cache" and phone cleaners do not touch it. Nothing in this class ever
 * deletes the current map except replacing it with a new bundle that has been
 * completely written and verified first.
 */
@CapacitorPlugin(name = "MapStore")
public class MapStorePlugin extends Plugin {
    private static final String ASSET = "mapdata/manila.mmap";
    private static final int BUF = 256 * 1024;
    private final ExecutorService io = Executors.newSingleThreadExecutor();

    static File mapsDir(Context ctx) {
        File d = new File(ctx.getFilesDir(), "maps");
        if (!d.exists()) d.mkdirs();
        return d;
    }

    static File currentFile(Context ctx) {
        return new File(mapsDir(ctx), "current.mmap");
    }

    private File incomingFile() {
        return new File(mapsDir(getContext()), "incoming.mmap");
    }

    // ---------------------------------------------------------------- status

    @PluginMethod
    public void status(PluginCall call) {
        io.execute(() -> {
            File cur = currentFile(getContext());
            JSObject r = new JSObject();
            boolean ok = false;
            String manifest = null;
            if (cur.exists() && cur.length() > 0) {
                try {
                    manifest = readManifest(cur).toString();
                    ok = true;
                } catch (Exception ignored) {
                    // unreadable file: report not installed but never delete it here
                }
            }
            r.put("installed", ok);
            r.put("sizeBytes", ok ? cur.length() : 0);
            r.put("manifest", manifest);
            r.put("location", "App storage (permanent): " + cur.getAbsolutePath());
            call.resolve(r);
        });
    }

    // ---------------------------------------------------------------- first-run install

    @PluginMethod
    public void install(PluginCall call) {
        io.execute(() -> {
            File cur = currentFile(getContext());
            try {
                if (cur.exists() && cur.length() > 0) {
                    try {
                        readManifest(cur);
                        call.resolve(okResult(cur));
                        return;
                    } catch (Exception ignored) {
                        // fall through and reinstall the bundled copy over a broken file
                    }
                }
                AssetManager am = getContext().getAssets();
                long total = -1;
                try {
                    total = am.openFd(ASSET).getLength();
                } catch (IOException ignored) {
                    // compressed asset: size unknown
                }
                File inc = incomingFile();
                try (InputStream in = am.open(ASSET, AssetManager.ACCESS_STREAMING)) {
                    copy(in, new FileOutputStream(inc), "copy", total);
                }
                verify(inc, null);
                swapIn(inc);
                call.resolve(okResult(cur));
            } catch (Exception e) {
                incomingFile().delete();
                call.reject("Could not install the offline map: " + e.getMessage());
            }
        });
    }

    // ---------------------------------------------------------------- backup / import

    @PluginMethod
    public void exportBackup(PluginCall call) {
        File cur = currentFile(getContext());
        if (!cur.exists()) {
            call.reject("No map data installed yet.");
            return;
        }
        String id = "backup";
        try {
            id = readManifest(cur).optString("id", "backup");
        } catch (Exception ignored) {}
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/octet-stream");
        intent.putExtra(Intent.EXTRA_TITLE, "manila-map-" + id + ".mmap");
        startActivityForResult(call, intent, "onExportPicked");
    }

    @ActivityCallback
    private void onExportPicked(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            JSObject r = new JSObject();
            r.put("ok", false);
            r.put("cancelled", true);
            r.put("error", "Backup cancelled");
            call.resolve(r);
            return;
        }
        Uri uri = result.getData().getData();
        io.execute(() -> {
            File cur = currentFile(getContext());
            try (InputStream in = new FileInputStream(cur); OutputStream out = getContext().getContentResolver().openOutputStream(uri, "w")) {
                if (out == null) throw new IOException("Cannot write to the chosen location");
                copy(in, out, "copy", cur.length());
                JSObject r = new JSObject();
                r.put("ok", true);
                r.put("fileName", displayName(uri));
                call.resolve(r);
            } catch (Exception e) {
                call.reject("Backup failed: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void importBackup(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        startActivityForResult(call, intent, "onImportPicked");
    }

    @ActivityCallback
    private void onImportPicked(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            JSObject r = new JSObject();
            r.put("ok", false);
            r.put("cancelled", true);
            r.put("error", "Import cancelled");
            call.resolve(r);
            return;
        }
        Uri uri = result.getData().getData();
        io.execute(() -> {
            File inc = incomingFile();
            try {
                long total = sizeOf(uri);
                try (InputStream in = getContext().getContentResolver().openInputStream(uri)) {
                    if (in == null) throw new IOException("Cannot read the chosen file");
                    copy(in, new FileOutputStream(inc), "copy", total);
                }
                JSONObject manifest = verify(inc, null);
                swapIn(inc);
                JSObject r = okResult(currentFile(getContext()));
                r.put("manifest", manifest.toString());
                call.resolve(r);
            } catch (Exception e) {
                inc.delete();
                call.reject("Import failed, your current map was kept. " + e.getMessage());
            }
        });
    }

    // ---------------------------------------------------------------- update (only when the user taps it)

    /**
     * url may point at a small JSON descriptor {"id","url","size","sha256"} or directly at a .mmap.
     * The current map stays in place until the new one is fully downloaded and verified.
     */
    @PluginMethod
    public void update(PluginCall call) {
        String url = call.getString("url");
        if (url == null || url.isEmpty()) {
            call.reject("No update address set");
            return;
        }
        io.execute(() -> {
            File inc = incomingFile();
            try {
                String expectSha = null;
                java.util.List<String> partUrls = new java.util.ArrayList<>();
                long total = -1;
                if (!url.toLowerCase().endsWith(".mmap")) {
                    JSONObject desc = new JSONObject(new String(httpGetSmall(url), StandardCharsets.UTF_8));
                    String remoteId = desc.optString("id", "");
                    String curId = "";
                    try {
                        curId = readManifest(currentFile(getContext())).optString("id", "");
                    } catch (Exception ignored) {}
                    if (!remoteId.isEmpty() && remoteId.equals(curId)) {
                        JSObject r = new JSObject();
                        r.put("ok", true);
                        r.put("upToDate", true);
                        call.resolve(r);
                        return;
                    }
                    expectSha = desc.optString("sha256", null);
                    total = desc.optLong("size", -1);
                    org.json.JSONArray parts = desc.optJSONArray("parts");
                    if (parts != null && parts.length() > 0) {
                        for (int i = 0; i < parts.length(); i++) {
                            partUrls.add(new URL(new URL(url), parts.getJSONObject(i).getString("url")).toString());
                        }
                    } else {
                        partUrls.add(new URL(new URL(url), desc.getString("url")).toString());
                    }
                } else {
                    partUrls.add(url);
                }
                // Download every part into one incoming file next to the current map.
                long[] done = { 0 };
                try (FileOutputStream out = new FileOutputStream(inc)) {
                    byte[] buf = new byte[BUF];
                    for (String partUrl : partUrls) {
                        HttpURLConnection c = open(partUrl);
                        if (total < 0 && partUrls.size() == 1) total = c.getContentLengthLong();
                        try (InputStream in = c.getInputStream()) {
                            int n;
                            while ((n = in.read(buf)) > 0) {
                                out.write(buf, 0, n);
                                done[0] += n;
                                progress("download", done[0], total > 0 ? total : done[0]);
                            }
                        } finally {
                            c.disconnect();
                        }
                    }
                    out.flush();
                    out.getFD().sync();
                }
                if (total > 0 && inc.length() != total) throw new IOException("Download was incomplete");
                JSONObject manifest = verify(inc, expectSha);
                swapIn(inc);
                JSObject r = okResult(currentFile(getContext()));
                r.put("manifest", manifest.toString());
                call.resolve(r);
            } catch (Exception e) {
                inc.delete();
                call.reject("Update failed, your current map was kept. " + e.getMessage());
            }
        });
    }

    // ---------------------------------------------------------------- helpers

    private JSObject okResult(File f) {
        JSObject r = new JSObject();
        r.put("ok", true);
        r.put("sizeBytes", f.length());
        try {
            r.put("manifest", readManifest(f).toString());
        } catch (Exception ignored) {}
        return r;
    }

    private static JSONObject readManifest(File f) throws Exception {
        try (ZipFile z = new ZipFile(f)) {
            ZipEntry e = z.getEntry("manifest.json");
            if (e == null) throw new IOException("manifest.json missing");
            try (InputStream in = z.getInputStream(e)) {
                JSONObject m = new JSONObject(new String(readAll(in), StandardCharsets.UTF_8));
                if (!"manila-mapbundle".equals(m.optString("format"))) throw new IOException("Not a Manila map bundle");
                return m;
            }
        }
    }

    /** Checks the bundle's structure, every entry's size and SHA-256, and optionally the whole-file SHA-256. */
    private JSONObject verify(File f, String wholeFileSha) throws Exception {
        long total = f.length();
        if (wholeFileSha != null && !wholeFileSha.isEmpty()) {
            String h = sha256(new FileInputStream(f), "verify", total);
            if (!h.equalsIgnoreCase(wholeFileSha)) throw new IOException("Download is damaged (checksum mismatch)");
        }
        JSONObject manifest = readManifest(f);
        JSONObject files = manifest.getJSONObject("files");
        try (ZipFile z = new ZipFile(f)) {
            long sum = 0;
            Iterator<String> it = files.keys();
            while (it.hasNext()) sum += files.getJSONObject(it.next()).getLong("size");
            long[] done = { 0 };
            it = files.keys();
            while (it.hasNext()) {
                String name = it.next();
                JSONObject info = files.getJSONObject(name);
                ZipEntry e = z.getEntry(name);
                if (e == null) throw new IOException("Missing " + name);
                if (e.getMethod() != ZipEntry.STORED) throw new IOException(name + " must be stored uncompressed");
                if (e.getSize() != info.getLong("size")) throw new IOException(name + " has the wrong size");
                MessageDigest md = MessageDigest.getInstance("SHA-256");
                byte[] buf = new byte[BUF];
                try (InputStream in = z.getInputStream(e)) {
                    int n;
                    while ((n = in.read(buf)) > 0) {
                        md.update(buf, 0, n);
                        done[0] += n;
                        progress("verify", done[0], sum);
                    }
                }
                String sha = info.optString("sha256", "");
                if (!sha.isEmpty() && !hex(md.digest()).equalsIgnoreCase(sha)) throw new IOException(name + " is damaged (checksum mismatch)");
            }
        }
        return manifest;
    }

    /** Atomically replaces current.mmap with a verified file. */
    private void swapIn(File verified) throws IOException {
        File cur = currentFile(getContext());
        File prev = new File(mapsDir(getContext()), "previous.mmap");
        prev.delete();
        if (cur.exists() && !cur.renameTo(prev)) throw new IOException("Could not move the old map aside");
        if (!verified.renameTo(cur)) {
            prev.renameTo(cur); // put the old map back
            throw new IOException("Could not install the new map");
        }
        prev.delete();
        progress("install", 1, 1);
    }

    private void copy(InputStream in, OutputStream out, String phase, long total) throws IOException {
        byte[] buf = new byte[BUF];
        long done = 0;
        long lastEmit = 0;
        try (OutputStream o = out) {
            int n;
            while ((n = in.read(buf)) > 0) {
                o.write(buf, 0, n);
                done += n;
                if (done - lastEmit > 1024 * 1024) {
                    progress(phase, done, total);
                    lastEmit = done;
                }
            }
            o.flush();
            if (o instanceof FileOutputStream) ((FileOutputStream) o).getFD().sync();
        }
        progress(phase, done, total > 0 ? total : done);
    }

    private long lastProgressAt = 0;

    private void progress(String phase, long loaded, long total) {
        long now = System.currentTimeMillis();
        if (loaded < total && now - lastProgressAt < 120) return;
        lastProgressAt = now;
        JSObject p = new JSObject();
        p.put("phase", phase);
        p.put("loaded", loaded);
        p.put("total", total);
        notifyListeners("progress", p);
    }

    private String sha256(InputStream in, String phase, long total) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] buf = new byte[BUF];
        long done = 0;
        try (InputStream i = in) {
            int n;
            while ((n = i.read(buf)) > 0) {
                md.update(buf, 0, n);
                done += n;
                progress(phase, done, total);
            }
        }
        return hex(md.digest());
    }

    private static String hex(byte[] d) {
        StringBuilder sb = new StringBuilder();
        for (byte b : d) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    private static byte[] readAll(InputStream in) throws IOException {
        ByteArrayOutputStream bo = new ByteArrayOutputStream();
        byte[] buf = new byte[8192];
        int n;
        while ((n = in.read(buf)) > 0) bo.write(buf, 0, n);
        return bo.toByteArray();
    }

    private static HttpURLConnection open(String url) throws IOException {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setInstanceFollowRedirects(true);
        c.setConnectTimeout(20000);
        c.setReadTimeout(60000);
        // follow cross-protocol redirects manually (GitHub release downloads redirect)
        for (int i = 0; i < 6; i++) {
            int code = c.getResponseCode();
            if (code >= 300 && code < 400) {
                String loc = c.getHeaderField("Location");
                c.disconnect();
                c = (HttpURLConnection) new URL(new URL(url), loc).openConnection();
                c.setConnectTimeout(20000);
                c.setReadTimeout(60000);
                continue;
            }
            if (code != 200) throw new IOException("Server answered " + code);
            return c;
        }
        throw new IOException("Too many redirects");
    }

    private static byte[] httpGetSmall(String url) throws IOException {
        HttpURLConnection c = open(url);
        try (InputStream in = c.getInputStream()) {
            return readAll(in);
        } finally {
            c.disconnect();
        }
    }

    private long sizeOf(Uri uri) {
        try (Cursor cur = getContext().getContentResolver().query(uri, new String[] { OpenableColumns.SIZE }, null, null, null)) {
            if (cur != null && cur.moveToFirst() && !cur.isNull(0)) return cur.getLong(0);
        } catch (Exception ignored) {}
        return -1;
    }

    private String displayName(Uri uri) {
        try (Cursor cur = getContext().getContentResolver().query(uri, new String[] { OpenableColumns.DISPLAY_NAME }, null, null, null)) {
            if (cur != null && cur.moveToFirst()) return cur.getString(0);
        } catch (Exception ignored) {}
        return "manila-map.mmap";
    }
}
