declare module 'jsonwebtoken' {
  export interface JwtPayload {
    [key: string]: any;
    iss?: string | undefined;
    sub?: string | undefined;
    aud?: string | string[] | undefined;
    exp?: number | undefined;
    nbf?: number | undefined;
    iat?: number | undefined;
    jti?: string | undefined;
  }

  export interface SignOptions {
    algorithm?: string;
    expiresIn?: string | number;
    notBefore?: string | number;
    audience?: string | string[];
    subject?:string;
    issuer?: string;
    jwtid?: string;
    mutatePayload?: boolean;
    header?: object;
    encoding?: string;
    noTimestamp?: boolean;
  }

  export interface VerifyOptions {
    algorithms?: string[];
    audience?: string | string[] | RegExp;
    clockTimestamp?: number;
    clockTolerance?: number;
    issuer?: string | string[];
    ignoreExpiration?: boolean;
    ignoreNotBefore?: boolean;
    jwtid?: string;
    subject?: string;
    maxAge?: string | number;
  }

  export class VerifyErrors extends Error {}

  export function sign(payload: string | Buffer | object, secretOrPrivateKey: string | Buffer, options?: SignOptions): string;
  export function verify(token: string, secretOrPublicKey: string | Buffer, callback?: (err: VerifyErrors | null, decoded: object | string | undefined) => void): void;
  export function verify(token: string, secretOrPublicKey: string | Buffer, options?: VerifyOptions, callback?: (err: VerifyErrors | null, decoded: object | string | undefined) => void): void;
  export function decode(token: string, options?: { complete?: boolean; json?: boolean }): null | { [key: string]: any } | JwtPayload;
}