package studio.chester.manilamaps;

import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebViewClient;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Serves https://localhost/_mapdata/current.mmap from the app's permanent files directory,
 * honouring HTTP Range requests so the map engine reads only the bytes it needs.
 */
public class MapDataWebViewClient extends BridgeWebViewClient {
    static final String PATH = "/_mapdata/current.mmap";
    private static final Pattern RANGE = Pattern.compile("bytes=(\\d+)-(\\d*)");
    private final File file;

    public MapDataWebViewClient(Bridge bridge, File file) {
        super(bridge);
        this.file = file;
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        Uri url = request.getUrl();
        if (PATH.equals(url.getPath()) && "localhost".equals(url.getHost())) {
            return serve(request);
        }
        return super.shouldInterceptRequest(view, request);
    }

    private WebResourceResponse serve(WebResourceRequest request) {
        Map<String, String> headers = new HashMap<>();
        headers.put("Accept-Ranges", "bytes");
        headers.put("Cache-Control", "no-store");
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Access-Control-Expose-Headers", "Content-Range, Content-Length");
        if (!file.exists()) {
            return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", headers, null);
        }
        try {
            final long size = file.length();
            String range = null;
            for (Map.Entry<String, String> h : request.getRequestHeaders().entrySet()) {
                if ("range".equalsIgnoreCase(h.getKey())) range = h.getValue();
            }
            long start = 0, end = size - 1;
            int status = 200;
            String reason = "OK";
            if (range != null) {
                Matcher m = RANGE.matcher(range.trim());
                if (m.matches()) {
                    start = Long.parseLong(m.group(1));
                    if (m.group(2) != null && !m.group(2).isEmpty()) end = Math.min(Long.parseLong(m.group(2)), size - 1);
                    if (start >= size || start > end) {
                        headers.put("Content-Range", "bytes */" + size);
                        return new WebResourceResponse("text/plain", "utf-8", 416, "Range Not Satisfiable", headers, null);
                    }
                    status = 206;
                    reason = "Partial Content";
                    headers.put("Content-Range", "bytes " + start + "-" + end + "/" + size);
                }
            }
            long length = end - start + 1;
            headers.put("Content-Length", String.valueOf(length));
            RandomAccessFile raf = new RandomAccessFile(file, "r");
            raf.seek(start);
            InputStream in = new RangeStream(raf, length);
            return new WebResourceResponse("application/octet-stream", null, status, reason, headers, in);
        } catch (IOException e) {
            return new WebResourceResponse("text/plain", "utf-8", 500, "Server Error", headers, null);
        }
    }

    static final class RangeStream extends InputStream {
        private final RandomAccessFile raf;
        private long remaining;

        RangeStream(RandomAccessFile raf, long length) {
            this.raf = raf;
            this.remaining = length;
        }

        @Override
        public int read() throws IOException {
            if (remaining <= 0) return -1;
            int b = raf.read();
            if (b >= 0) remaining--;
            return b;
        }

        @Override
        public int read(byte[] buf, int off, int len) throws IOException {
            if (remaining <= 0) return -1;
            int n = raf.read(buf, off, (int) Math.min(len, remaining));
            if (n > 0) remaining -= n;
            return n;
        }

        @Override
        public int available() {
            return (int) Math.min(Integer.MAX_VALUE, remaining);
        }

        @Override
        public void close() throws IOException {
            raf.close();
        }
    }
}
