/**
 * @file ExpressのRequestオブジェクトを拡張する型定義ファイルです。
 * @description 認証ミドルウェアによって追加される`user`プロパティを、Expressの`Request`オブジェクトに定義します。
 */
declare namespace Express {
  /**
   * ExpressのRequestインターフェースを拡張し、認証済みユーザーのプロパティを追加します。
   */
  export interface Request {
    /**
     * 認証済みのユーザー情報を含むオブジェクトです。
     * 認証ミドルウェアがこのプロパティをリクエストに追加します。
     * @property {string} id - 認証済みユーザーの一意なID
     */
    user: {
      id: string;
    };
  }
}
