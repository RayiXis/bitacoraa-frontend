import { CanActivateFn } from '@angular/router';
import * as crypto from 'crypto-js';

export const RestorePasswordGuard: CanActivateFn = async (route, state) => {
  try {
    const token = route.queryParams['token'];
    const encodeData = crypto.enc.Base64.parse(token.split('.')[1]);
    const decodeData = crypto.enc.Utf8.stringify(encodeData);

    const decoder = new TextDecoder('utf-8');
    decoder.decode();

    const decodedToken = JSON.parse(decodeData);
    const { type } = decodedToken;

    if (type === 'passchange') {
      return true;
    } else {
      window.location.href = '/bitacora';
      return false;
    }
  } catch (error) {
    console.error(error);
    window.location.href = '/bitacora';
    return false;
  }
};
