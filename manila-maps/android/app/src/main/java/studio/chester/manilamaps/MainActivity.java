package studio.chester.manilamaps;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(MapStorePlugin.class);
        super.onCreate(savedInstanceState);
        // Serve the permanent map file to the WebView with real byte-range support.
        if (bridge != null) {
            bridge.setWebViewClient(new MapDataWebViewClient(bridge, MapStorePlugin.currentFile(this)));
        }
    }
}
