import { IExternalUserGroup } from '~/interfaces/external-user-group';
import { IUser } from '~/interfaces/user';

abstract class ExternalUserGroupSyncService {

  // 全グループ同期メソッド
  /* 継承先の実メソッドイメージ
     1. 読み込まれたパラメータを元に外部グループを全て取得する
     2. 各親グループについて、createUpdateExternalUserGroup を呼び出す
     3. 子についても同様に呼び出し、返却された子グループを親グループと紐付ける
     4. 2, 3 を再起的に行う
         - 木探索アルゴリズムはなんでも良いが、実クラスで実装が容易になるように上手く抽象化したい
     5. 「外部サービスから削除されたグループを GROWI に残すか」が false の場合、木探索の過程で見つからなかった ExternalUserGroup は削除する
    */
  abstract syncExternalUserGroups(): void

  // グループ生成/更新メソッド
  /* 継承先の実メソッドイメージ
     1. 読み込まれたパラメータを元に外部グループ情報をリクエストする
     2. 読み込まれたパラメータと 1 で返却された外部グループ情報を元に ExternalUserGroup を生成/更新する
     3. 外部グループ情報にある各ユーザ情報を元に、ExternalUserGroup に所属していないメンバーについて getMemberUser を呼び出し、返却されたユーザを ExternalUserGroup に所属させる (ExternalUserGroupRelation を生成する)
     4. ExternalUserGroup を返却する
    */
  // abstract createUpdateExternalUserGroup(): IExternalUserGroup

  // ユーザ検索メソッド
  /* 継承先の実メソッドイメージ
     1. 読み込まれたパラメータパラメータを元に外部ユーザ情報をリクエストする
     2. 読み込まれたパラメータと 1 で返却された外部ユーザ情報を元に GROWI User を検索し、返却する
       - 「作成されていない GROWI アカウントを自動生成するか」が true の場合、検索して見つからなければ生成して返却する
    */
  // abstract getMemberUser(): IUser

}

export default ExternalUserGroupSyncService;
