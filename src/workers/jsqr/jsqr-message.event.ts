export type JsqrMessageEvent =
  | {
      event: 'decoded';
      data: {
        content: null | object | string;
        location: null | string;
      };
    }
  | {
      event: 'invalid';
      data: { message: unknown };
    };
export type JsqrEventNames = JsqrMessageEvent['event'];

export type JsqrRequestEvent = {
  event: 'processImage';
  data: ImageData;
};
export type JsqrRequestEventNames = JsqrRequestEvent['event'];
