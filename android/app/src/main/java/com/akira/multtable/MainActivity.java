package com.akira.multtable;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // edge-to-edge с отступом под статус-бар решается CSS safe-area, а статус-бар остаётся светлым
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
    }
}
