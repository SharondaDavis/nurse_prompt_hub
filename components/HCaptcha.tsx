// components/HCaptcha.tsx
import React from 'react';
import { WebView } from 'react-native-webview';
import { View } from 'react-native';

export default function HCaptcha({ onVerify }: { onVerify: (token: string) => void }) {
  const siteKey = "your-hcaptcha-site-key"; // Replace with your actual key

  const html = `
    <html>
    <head>
      <script src="https://js.hcaptcha.com/1/api.js" async defer></script>
    </head>
    <body>
      <div id="h-captcha" class="h-captcha" data-sitekey="${siteKey}" data-callback="sendToken"></div>
      <script>
        function sendToken(token) {
          window.ReactNativeWebView.postMessage(token);
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ height: 180 }}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        onMessage={(event) => onVerify(event.nativeEvent.data)}
      />
    </View>
  );
}
