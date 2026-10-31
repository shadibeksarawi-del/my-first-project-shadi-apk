// يُشغَّل مرة واحدة بعد: npx cap add android
// يضيف جسر الطباعة الأصلي (طباعة / حفظ PDF) إلى MainActivity
const fs = require('fs'), path = require('path');
const cfg = JSON.parse(fs.readFileSync('capacitor.config.json', 'utf8'));
const pkg = cfg.appId;
const dir = path.join('android', 'app', 'src', 'main', 'java', ...pkg.split('.'));
if (!fs.existsSync(dir)) { console.error('لم يُعثر على مجلد أندرويد؛ نفّذ npx cap add android أولاً'); process.exit(1); }
const java = `package ${pkg};

import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        WebView wv = getBridge().getWebView();
        wv.addJavascriptInterface(new PrintBridge(), "AndroidPrint");
    }

    class PrintBridge {
        @JavascriptInterface
        public void print() {
            runOnUiThread(() -> {
                WebView wv = getBridge().getWebView();
                PrintManager pm = (PrintManager) getSystemService(PRINT_SERVICE);
                PrintDocumentAdapter adapter = wv.createPrintDocumentAdapter("report");
                pm.print("report", adapter, new PrintAttributes.Builder().build());
            });
        }
    }
}
`;
fs.writeFileSync(path.join(dir, 'MainActivity.java'), java);
console.log('تم تعديل MainActivity.java');
