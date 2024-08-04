import jsQR from 'jsqr-es6';
import { JsqrMessageEvent, JsqrRequestEvent } from './jsqr-message.event';
const ctx: Worker = self as unknown as Worker;
function sendMessage(message: JsqrMessageEvent) {
  ctx.postMessage(message);
}
ctx.addEventListener('message', function (event) {
  const messageData = event.data as JsqrRequestEvent;
  if (messageData.event == 'processImage') {
    const imageData = messageData.data;
    const result = jsQR(imageData.data, imageData.width, imageData.height, {
      canOverwriteImage: true,
      inversionAttempts: 'attemptBoth',
    });
    let content = null;
    const location = null;
    if (typeof result?.data == 'string' && /^[\{\[]/i.test(result.data)) {
      content = JSON.parse(result.data);
    } else {
      content = result?.data;
    }
    //send even if content is null to trigger next-frame
    sendMessage({
      event: 'decoded',
      data: {
        content,
        location,
      },
    });
  }
});
