# Implementation Plan — chat-integration-proxy

> umbrella spec: [chat-integration](../chat-integration/)。要件は umbrella の `requirements.md` が持つ。
> **本 spec が担当する要件 ID は 66 件**（85 件は 3 つの sub-spec で分担する）。

**`chat-integration-protocol` の完了が前提。** 本 spec は `@growi/chat` の型と関数に依存する。

**層の順序を守る** — `types → capabilities → db → platform → command → relation → growi → orchestration → routes`。
`runtime/` は最も外側で、上のどこからも参照されない。**受け口は束ねる層を呼ぶ**（逆ではない）。

**各タスクは自分のファイルから直接出す。層の入口はその層の最後のタスクが作る**（各章の末尾に印がある）。
そうしないと、同じ層で並行して進むタスクが 1 つの入口ファイルを取り合う。

---

- [x] 1. 土台を作る
- [x] 1.1 新規アプリ `apps/chat-integration-proxy` の雛形を用意する
  - package.json・tsconfig・turbo.json・vitest の設定を置く。**build は `@growi/chat` の build に依存する**と宣言する
  - Biome と Vitest を最初から使う。HTTP は Hono、DI コンテナは使わない
  - Chat SDK はバージョンを完全に固定して入れる
  - `pnpm --filter @growi/chat-integration-proxy build` と `test` が通る
  - _Requirements: 1.1_

- [x] 1.2 開発と試験で使う PostgreSQL を用意する
  - **devcontainer には PostgreSQL が無い**（あるのは app・mongo・elasticsearch だけ）ので、
    サービスとして足し、接続の情報を開発用の設定に置く
  - **Chat SDK の state が使う schema も同じ DB に用意する**（分散ロックと重複排除がそこに乗るので、
    自分たちの 10 個の表だけでは足りない）
  - 試験から接続でき、**この作業が無いと 1.4・2.1・2.2・8.1・9.2・11.x のどれも完了を確かめられない**
  - 接続して問い合わせが 1 本通ることが確かめられる
  - _Requirements: 1.1_

- [x] 1.3 層をまたぐ型を宣言する
  - 保存層が返す型（関係・コマンドの起動）、投稿するもの、履歴、分散ロック、
    やり取りの参照・期間・入力欄の形
  - **チャットから届くイベントの型、アプリごとの設定の型、workspace ごとの資格情報の型**も
    ここに置く（設定を読む処理も保存層も、この型を参照する）
  - **Chat SDK の型を 1 つも含めない**
  - 型が宣言され、以降のすべての層から参照できる
  - _Requirements: 1.1_
  - _Boundary: types_

- [x] 1.4 保存するものの下地を作る
  - 10 個の表と索引を宣言する — installation・relation・peer_key・own_key・pairing_order・
    request_nonce・processed_notification_target・installation_channel・channel_permission・pending_collection
  - **関係の識別子は推測できない値にする**（署名ヘッダに載って外へ出るため、連番にしない）
  - 鍵の表は関係・側・鍵名の組で一意。使い捨ての値の表は関係・鍵名・値の組が主キー
  - 通知の記録は**宛先ごと**（関係・要求の識別子・サービス・チャンネルの組が主キー）
  - proxy 自身の鍵の表は、入れ替えの途中経過（置き換える相手・相手が受け付けた時刻）も持つ
  - 登録コードの控えは、2 度目の申し込みに同じ結果を返すために関係の識別子も持つ
  - Chat SDK の state が使う領域は**別の schema に置き、触らない**
  - 移行が流せて、10 個の表と索引が実際に作られる
  - _Requirements: 8.1, 10.4, 10.5_
  - _Depends: 1.2, 1.3_

- [x] 1.5 設定を読む唯一の場所を作る
  - 環境変数を読んでよいのはこのファイルだけ。他の層へは**値ではなく関数**の形で渡す
  - アプリごとの設定（サービスごとの資格情報のうち、**アプリに 1 つしか無い値**）を読む
  - 保存を暗号化する鍵を読む。**未設定なら起動しない**（平文で保存に落とさない）
  - 閉域向けの設定 — 許す宛先の一覧と、その宛先へつなぐときに信頼する証明書の根拠
  - 設定が揃っていれば起動し、暗号化の鍵が無ければ理由を示して止まる
  - _Requirements: 13.1_
  - _Depends: 1.3_

- [x] 1.6 能力の差を 1 か所の表にする
  - 能力ごとに 4 サービス分の値を持つ。**値は 4 段階**（使える・劣るが使える・使えない・確かめていない）
  - 「使える」と答えるのは最上位のときだけ。**確かめていない値に寄りかからない**
  - **接続をどの単位で張るかは能力とは別の軸**として持つ（意味が反転するので混ぜない）
  - 外から接続を受ける必要があるかも、能力とは別に持つ
  - 管理者かどうかの調べ方も、同じ隣にデータとして置く（サービス名で分岐しない）
  - **表に載っている全ての能力について 4 サービス分が埋まっている**ことが試験で示される（数を書かない）
  - _Requirements: 1.2, 5.1, 5.6, 6.5, 13.2_
  - _Depends: 1.3_
  - _Boundary: PlatformCapabilities_

- [x] 1.7 決まりを試験で固定する
  - **層の順序に反する参照**（右の層から左の層へ、`runtime/` への参照）を見つけて落とす試験
  - **Chat SDK を `platform/` 以外から読み込むことを禁じる試験。**
    これは層の順序では捕まらない（Chat SDK は層ではなく外部のパッケージなので、
    束ねる層が直に読み込んでも層の参照としては正しく見える）。
    design が platform 層を作った理由そのものなので、**別の試験として書く**
  - **2 つとも、わざと違反する参照を 1 つ足して落ちることを確かめる**（見てから戻す）
  - _Requirements: 1.1_
  - _Depends: 1.6_

- [x] 2. 保存層を作る
- [x] 2.1 (P) 連携先と鍵を読み書きする
  - installation・関係・相手の公開鍵・**proxy 自身の鍵**・登録コードの控えを読み書きする
  - 資格情報と秘密鍵は**暗号化して保存し、復号はこの層の中だけ**で行う
  - 保存して読み直すと同じ値が返り、暗号化した列が保存の上では読めない
  - _Requirements: 8.1, 10.5, 10.6_
  - _Depends: 1.4_
  - _Boundary: db/repositories（連携先と鍵）_

- [x] 2.2 (P) 判定と途中経過に使うものを読み書きし、期限切れを消す関数を用意する
  - チャンネル権限・installation のチャンネル一覧・**宛先ごとの通知の記録**・
    使い捨ての値・引数の収集の途中経過を読み書きする
  - **期限切れを消す処理は関数として用意するだけ**にする。ロックを取って周期で回すのは 9.2 が持つ
    （ロックは Chat SDK の state が持ち、platform 層が外へ出すので、この層からは呼べない）
  - 通知の記録は宛先ごとに読み書きでき、投稿済みの宛先だけを飛ばせる
  - _Requirements: 2.4, 10.4, 10.7, 11.5_
  - _Depends: 1.4_
  - _Boundary: db/repositories（判定と途中経過）_

- [x] 2.3 保存層の入口を作る
  - 2.1 と 2.2 が出すものを 1 つの入口にまとめる
  - 上の層がこの入口だけを参照して、保存層の中のファイルを直に読まないことが試験で示される
  - _Requirements: 8.1_
  - _Depends: 2.1, 2.2_

- [x] 3. Chat SDK に触れる層を作る
- [x] 3.1 アダプタと bot を組み立てる
  - 接続情報を受け取ってアダプタと state を組み立てる。**Chat SDK に触れてよいのはこの層だけ**
  - 4 サービス分のアダプタを、能力表を読んで同じ形で扱う
  - **分散ロックを外へ出す**（Chat SDK の state が持つものを、SDK の型を含まない形で渡す）
  - 4 サービスそれぞれで bot が組み立てられ、ロックが取れる
  - _Requirements: 1.1_
  - _Depends: 1.6, 1.7_
  - _Boundary: PlatformFacade_

- [x] 3.2 (P) workspace ごとの資格情報を解決し、受け持ちを列挙する
  - workspace の識別子から資格情報を引く
  - **接続が受け持つ installation を列挙する。**「あるべき接続の本数」は installation の数では決まらない
    （アプリごとの接続は、そのサービスの設定があるかどうかで決まる）
  - 1 台の proxy に複数の workspace がぶら下がる形で、それぞれの資格情報が正しく引けることが試験で示される
  - _Requirements: 1.1, 8.1_
  - _Depends: 3.1, 2.1_
  - _Boundary: InstallationProvider_

- [x] 3.3 (P) SDK のイベントを内部の表現へ変換する
  - 扱う 5 種類（呼びかけ・スラッシュコマンド・入力欄の送信・ボタン・URL の投稿）を変換する
  - **呼びかけ無しの返信は受け取らない**（能力を確かめられていないので、型にも入れない）
  - **SDK の型はこの層で止まる**ことが試験で示される（変換後の型に SDK の型が現れない）
  - _Requirements: 1.1, 1.2_
  - _Depends: 3.1_
  - _Boundary: PlatformFacade_

- [x] 3.4 (P) 投稿と差し替えを扱う
  - 投稿・差し替え・**本人にだけ見えるメッセージ**
  - 能力が劣るサービスでは代わりの手段を選ぶ（そのサービス名で分岐せず、能力表を読んで決める）
  - 4 サービスで投稿ができ、**差し替えの参照が取れる**
  - _Requirements: 1.1, 2.4_
  - _Depends: 3.1_
  - _Boundary: PlatformFacade_

- [x] 3.5 (P) 入力欄と発言の履歴を扱う
  - 入力欄の開閉（使えるサービスのみ）と、期間を指定した発言の履歴の取り出し
  - 履歴が取れないサービスでは、その旨を返して呼ぶ側が代わりの手段を選べるようにする
  - 入力欄が使えるサービスで開閉ができ、履歴が期間で取り出せる
  - _Requirements: 1.2, 5.4_
  - _Depends: 3.1_
  - _Boundary: PlatformFacade_

- [x] 3.6 (P) チャンネルの一覧を取り直す関数を用意する
  - installation ごとに一覧を取り、保存する**関数を用意する**。周期で回すのは 9.2 が持つ
  - **一度も取れていない状態と、取れた結果が空だった状態を区別する**
    （前者で「そのチャンネルは無い」と答えると、運用者に間違った直し方を案内してしまう）
  - 取り直しに失敗したら、最後に取れた一覧をそのまま使い続ける
  - 一覧が保存され、一度も取れていない installation が区別できる
  - _Requirements: 2.2, 2.4, 11.1_
  - _Depends: 3.1, 2.2_
  - _Boundary: ChannelDirectory_

- [x] 3.7 installation を作る・消す
  - 2 つの入り口を受けられる形にする — 折り返しで受け取る形と、設定ファイルから読む形
  - **作った直後に 1 回、チャンネルの一覧を取り直す**（これが無いと、紐付けた直後は
    一覧が空のまま最初の周期を待つことになり、その間の通知がすべて断られる）
  - installation が作られ、**直後にチャンネルの一覧が保存されている**
  - _Requirements: 1.1, 1.5, 8.1_
  - _Depends: 3.6, 3.2_
  - _Boundary: InstallationStore_

- [x] 3.8 常時接続の生涯を作り、この層の入口をまとめる
  - **起動時に 1 回張るのではなく、あるべき姿との差を埋め続ける**形にする
  - 接続の単位は能力表とは別の軸から読む（アプリごとに 1 本のサービスと、installation ごとのサービス）
  - 各回で、持っていないロックを取りに行き、持っているロックを延ばし、
    延長に失敗したら自分の接続を閉じ、受け持ちが 0 件になったときだけ閉じる
  - **アプリごとの接続は受け持ちが 0 件でも保つ**（開くのに使う値は installation ではなく設定から取る）
  - ロックの寿命は回す間隔の 3 倍以上にする
  - 状態を外へ見せる。**別の台が持っている状態は「つながっている」に寄せる**
    （どの台が持っているかは呼ぶ側の関心ではない。3 台構成で 3 回に 2 回「切断」と出るのを避ける）。
    接続を張らないサービスには専用の値を返す
  - **この層の入口もここでまとめる**
  - 切れたら張り直し、1 つの接続の失敗が他へ波及しないことが試験で示される
  - _Requirements: 1.1, 1.4, 13.2_
  - _Depends: 3.2, 3.3, 3.4, 3.5, 3.7_
  - _Boundary: ConnectionManager_

- [ ] 4. コマンドを受け取る層を作る
- [x] 4.1 (P) 呼びかけとスラッシュコマンドを 1 つの内部表現へ揃える
  - どちらの入り口から来ても同じ形になる
  - 同じ内容の呼びかけとスラッシュコマンドが同じ内部表現になることが試験で示される
  - _Requirements: 1.2, 3.1, 4.1, 14.1_
  - _Depends: 1.3_
  - _Boundary: CommandInvocation_

- [x] 4.2 (P) 利用者が打てるコマンドを宣言する
  - 打つ言葉・集める値・送るもの・対象の決まり方・権限判定に使う名前を**1 か所の表**として持つ
  - **紐付けを始めるコマンドだけ送るものが違う**（共有する契約を広げないため、コマンド名の語彙には足さない）
  - **紐付けを始めるコマンドはチャンネル権限の判定に掛けない**。対象は紐づく全 GROWI から選ばせる
  - 検索の件数は proxy が決める（利用者には聞かない）
  - 宣言に無い言葉が打てず、性質を書いていないコマンドを作れない
  - _Requirements: 3.1, 4.1, 5.1, 7.3, 14.1_
  - _Depends: 1.3_
  - _Boundary: CommandSet_

- [x] 4.3 (P) 運用者向けコマンドを解釈する
  - 登録コードの発行・解除・検索の重み・鍵の入れ替え・入れ替えの途中経過を解釈する
  - **文字列の解釈と結果の組み立てだけを持つ。実際の呼び出しは束ねる層が行う**
    （直に呼ぶと、宣言した層の順序を逆走する）
  - **実行できるのは workspace の管理者だけ**。調べ方は能力表の隣のデータから引く
  - 登録コードは**本人にだけ見えるメッセージ**で返す（チャンネルに平文で出さない）
  - 管理者でない利用者が実行できないことが試験で示される（4 サービス分）
  - _Requirements: 3.8, 9.1, 9.7, 10.5, 13.4_
  - _Depends: 4.1, 1.6_
  - _Boundary: AdminCommandSet_

- [ ] 4.4 引数を集めて再開できるようにし、この層の入口をまとめる
  - 入力欄が使えるサービスでは入力欄、使えないサービスでは聞き返しで集める
    （サービス名で分岐せず、能力表を読んで決める）
  - **手がかりが無い・失効しているときは、能力表が使えると言っていても聞き返しへ落とす**
  - 途中経過を保存し、別のプロセスでも再開できる。期限切れの途中経過を消す関数も用意する
  - **この層の入口もここでまとめる**
  - 同じ入力欄の宣言から、入力欄と聞き返しの両方で値が集まることが試験で示される
  - _Requirements: 1.2, 4.1, 5.2, 8.2, 11.5_
  - _Depends: 4.2, 4.3, 2.2, 3.5_
  - _Boundary: ArgumentCollector_

- [ ] 5. GROWI との関係を扱う層を作る
- [ ] 5.1 申告された URL へ安全につなぐ
  - **リクエストごとに名前を引き直し、引いたアドレスを判定に掛け、確かめたアドレスへつなぐ**
  - **リダイレクトを追わない。**待ち時間に上限を置く
  - 引いた結果は短い時間だけ覚える（検索は紐づく GROWI の数だけ同時に出るため）
  - 運用者が明示した宛先には、指定された証明書の根拠を使う。**照合名は URI に書かれたホスト名**
  - 判定は `@growi/chat` の関数を呼ぶ（同じ判定をここに書き直さない）
  - **ペアリングのときだけでなく、保存した URL へ送る毎リクエストで判定が掛かる**ことが試験で示される
  - _Requirements: 9.2, 13.1_
  - _Depends: 1.5, 1.3_
  - _Boundary: GrowiUriResolver_

- [ ] 5.2 proxy 自身の鍵を作り、保管する
  - 関係ごとに鍵を分ける（1 つの関係の鍵が漏れても他へ波及しない）
  - ペアリングの成立時に、関係の行と**同じトランザクションで**鍵を書く
  - 署名するときは、**復号した値ではなく署名する手段**を上の層へ渡す
  - 鍵が作られ、関係の行と同時に保存されることが試験で示される
  - _Requirements: 9.5, 9.6_
  - _Depends: 2.1_
  - _Boundary: RelationKeyService_

- [ ] 5.3 (P) どの GROWI に対して実行するかを決める
  - 対象が 1 つに定まる操作で許可している GROWI が複数なら選ばせ、1 つなら選ばせずに実行する
  - 全 GROWI 対象の操作は選ばせず、許可している全 GROWI へ配る
  - URL の一致で決まる操作は選ばせない
  - どれも紐づいていない・許可していないときは実行せず理由を示す
  - 4 つの場合それぞれで正しい分岐に入ることが試験で示される
  - _Requirements: 6.4, 8.1, 8.2, 8.3, 8.4, 8.6_
  - _Depends: 2.1, 4.2_
  - _Boundary: GrowiSelector_

- [ ] 5.4 (P) ペアリングの proxy 側を作る
  - 登録コードを発行して控えを持つ（**平文で持たず**、発行数と間違えた試行に上限を置く）
  - 申し込みを受け、申告された URL を判定してから所有の確認を送る
  - **確認の値を送る関数は引数で受け取る**（この層は GROWI を呼ぶ層を参照しない）
  - 応答は検証の前に形を確かめる（**署名の付かない相手から届く唯一の応答**）
  - 値の一致だけでなく**署名も検証する**（一致だけだと、第三者が本物の URL と自分の鍵で申し込んだときに通る）
  - 成立したら関係と双方の鍵を書き、**自分の公開鍵と関係の識別子を返す**
  - 2 度目の同じ申し込みには**同じ結果を返し、新しい関係を作らない**。同じ GROWI の二重の紐付けを断る
  - _Requirements: 8.5, 9.1, 9.2, 9.3, 9.4, 9.5_
  - _Depends: 5.1, 5.2, 2.1_
  - _Boundary: PairingService_

- [ ] 5.5 紐付けの解除を作り、この層の入口をまとめる
  - 関係に連なる鍵・チャンネル権限・途中経過・通知の記録を消し、**最後に関係の行そのものを消す**
    （消さないと、同じ GROWI をもう一度申し込んだときに「既に紐付いている」が返り続ける）
  - **installation のチャンネル一覧は消さない**（この表は installation ごとで関係ごとではない。
    消すと同じ workspace の他の GROWI からの通知が次の取り直しまで断られる）
  - **この層の入口もここでまとめる**
  - 秘密鍵が残らないことと、解除後に同じ GROWI を繋ぎ直せることが試験で示される
  - _Requirements: 9.7_
  - _Depends: 5.3, 5.4_
  - _Boundary: UnpairService_

- [ ] 6. GROWI を呼ぶ層を作る
- [ ] 6.1 署名つきで GROWI を呼び、応答の形を確かめる
  - **必ず URL の解決を通す。直に呼ばない**（2 か所が別々に組み立てると片方だけ判定が抜ける）
  - 本体に関係の識別子と口の名前を載せ、署名して送る。**すべて POST**
  - 送る操作は 4 つ — コマンド・紐付けの開始・**設定の取り直し**・鍵の追加と失効
    （設定の取り直しは、押し込みが届かなかったときの保険）
  - **受け取った応答は必ず検査関数を通す**（応答に署名は付かないので、形の確かめが唯一の受け入れ条件）
  - 再送は要求の識別子を据え置き、使い捨ての値と時刻を取り直して署名し直す
  - 壊れた応答が断られ、再送の 2 回目が受け入れられることが試験で示される
  - _Requirements: 3.1, 4.2, 5.2, 7.3, 9.2, 10.1, 11.4, 14.2_
  - _Depends: 5.1, 5.2_
  - _Boundary: GrowiClient_

- [ ] 6.2 鍵の入れ替えを最後まで進められるようにする
  - 入れ替えは 4 段（作る → 配る → 未達を記録 → 全員に届いたときだけ失効）。**単位は workspace**
  - **2 回目以降は作り直さず、届いていない相手にだけ配り直す**（毎回作り直すと、
    運用者が相手側を直してもう一度打つたびに鍵が増え、古い鍵は失効しないまま積み上がる）
  - **失効は別の操作に分ける。**同じ関数の条件分岐にすると書き忘れで壊れるが、分ければ呼ばないだけで守れる
  - 失効の前に**相手へも失効を伝える**（伝えないと、相手は古い公開鍵を持ったままになる）
  - 未達が 1 件あるうちは古い鍵が失効せず、相手を直して打ち直すと配り直して初めて失効することが試験で示される
  - _Requirements: 10.5, 10.6_
  - _Depends: 6.1, 5.2_
  - _Boundary: RelationKeyService_

- [ ] 6.3 複数の GROWI へ配って待ち合わせ、結果を 1 本にまとめ、この層の入口をまとめる
  - 宛先ごとに要求の識別子と関係を作り替えて配る。同時に出す本数に上限を置く
  - **落とした相手も引数で受け取る**（配る相手だけを渡すと、示す理由の材料が無く常に空になる）。
    応答を取り出す関数も引数で受け取る。1 台も応答しなくても例外を投げない
  - **いったん投稿して差し替える**段取りにする（受け付けの段階ではまだ差し替えの参照が作れない）。
    チャットサービスの応答期限には先に受け付けを返し、結果が揃ってから改めて投稿する
  - 検索の結果は**重みつきの式のまま**統合する（単なる交互配置として実装しない）
  - ヘルプも同じ待ち合わせを使い、**どの GROWI のヘルプかが分かる形で区別して示す**
  - **この層の入口もここでまとめる**
  - 3 台のうち 1 台が時間切れ・1 台が権限で外れたとき、**残り 1 台の結果と、
    外れた 2 台の理由の両方が示される**こと。重みを変えると順位が変わることが試験で示される
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.8, 11.3, 14.3, 14.5_
  - _Depends: 6.1, 3.4_
  - _Boundary: FanOutCollector, SearchFusion_

- [ ] 7. 各層を束ねる
- [ ] 7.1 イベントを受けて振り分ける
  - 5 種類のイベントそれぞれの行き先を決める（呼びかけだけ 3 段の順序を通す）
  - 呼びかけはまず内部表現への正規化を試し、解釈できなければ収集の再開へ渡し、
    自分のものでなければ何もしない
  - **URL の投稿は要約の流れへ渡す**（コマンドの解釈を通さない）
  - **新しいコマンドが優先される**（途中経過がある状態でコマンド名を打つと、古い途中経過は破棄）
  - 5 種類すべてが正しい行き先へ渡ることが試験で示される
  - _Requirements: 1.1, 1.2, 3.1, 4.1, 6.1, 14.1_
  - _Depends: 3.3, 4.1, 4.4_
  - _Boundary: EventSink_

- [ ] 7.2 利用者コマンドの流れを組み立てる
  - 権限の判定 → GROWI の選択 → 引数の収集 → 送信 → 投稿 の順に呼ぶ
  - **紐付けが要るという応答と、紐付けを始めるコマンドの投稿経路を 1 本にする。**
    どちらも**本人にだけ見えるメッセージ**で出し、複数の GROWI が紐づくときは
    どの GROWI に対する紐付けかを必ず添える
  - **取り込む範囲に発言が 1 件も無いときは、ページを作らず利用者に示す**（GROWI へ送らない）
  - **ヘルプは、そのチャンネルで許可されていないコマンドを外して出す**（権限の判定を通す）
  - 5 つのコマンドが通しで動き、紐付けが要るときの案内が本人にだけ見える形で出る
  - _Requirements: 3.1, 4.1, 5.5, 6.1, 7.6, 8.2, 11.3, 14.1, 14.3, 14.4_
  - _Depends: 7.1, 5.3, 6.3_
  - _Boundary: orchestration_

- [ ] 7.3 運用者コマンドの実行と、GROWI から届くものの流れを組み立てる
  - 運用者コマンドの**実際の呼び出し**をここが行う（解釈する層は結果を値で返すだけ）
  - 通知の投稿（**宛先ごとに記録し、投稿済みの宛先は飛ばす**）、設定の押し込み、鍵の追加と失効
  - 通知の宛先が**その関係の installation に属することを確かめる**。
    「その workspace のチャンネルか」と「bot が入っているか」と「一覧をまだ取れていない」を書き分ける
  - 設定は版が自分の持つものより大きいときだけ書く
  - 鍵の失効は、有効な鍵が 0 本になる要求を断る（`@growi/chat` の判定を呼ぶ）
  - **この層の入口もここでまとめる**
  - 一部の宛先だけ失敗した通知をやり直すと、成功した宛先に二重に投稿されないことが試験で示される
  - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 9.1, 9.7, 10.5, 10.7, 11.4_
  - _Depends: 7.2, 4.3, 5.5, 6.2, 3.6_
  - _Boundary: InboundFlow_

- [ ] 8. 受け口を作る
- [ ] 8.1 届くリクエストの署名を検証する
  - **口を作る作業より先に置く。**後にすると、口ごとに実装者が各自で決めることになり、
    1 か所緩いだけで守りが崩れる
  - **本体は生のバイト列で受ける。**解析して組み立て直したものを検証に渡さない
    （鍵の並び順が送信時と一致する保証が無く、正しい相手が弾かれる）
  - 公開鍵と使い捨ての値を引く関数を引数で受け取る。どちらも関係と鍵名の組で引き、
    **相手側の鍵だけを返す**
  - **使い捨ての値に渡す期限は受ける側が上限で切った値**にし、**検証に成功した後にだけ**消費する
  - 失敗の種類を運用者向けに記録する。**署名そのものと本文は記録しない**
  - **どの口を叩いたかは、口の表からデータとして引く**（各ハンドラに直接書くと、隣の口と同じ値を書き間違える）
  - 本体を 1 バイト変えると断られ、期限切れ・再送・知らない鍵がそれぞれの種類で断られることが試験で示される
  - _Requirements: 10.1, 10.2, 10.3, 10.4_
  - _Depends: 2.1, 2.2_
  - _Boundary: SignatureGuard_

- [ ] 8.2 (P) 通知と設定の口を作る
  - 通知の投稿と設定の押し込みの 2 口
  - **署名を確かめた後、本体の関係の識別子と口の名前を突き合わせてから処理する**
  - 二重に処理しない手立てを口ごとに実装する（通知は宛先ごとの記録、設定は版）
  - 中身は束ねる層を呼ぶ
  - 同じ通知を 2 度送ると、投稿済みの宛先に二重に投稿されないことが試験で示される
  - _Requirements: 2.1, 2.2, 2.5, 2.6, 10.7, 11.2, 11.4_
  - _Depends: 8.1, 7.3_
  - _Boundary: routes（通知と設定）_

- [ ] 8.3 (P) 鍵の口と読み取りの口を作る
  - 鍵の追加と失効の 2 口、能力の一覧・接続の状態・チャンネルの一覧の 3 口
  - **返す範囲を口ごとに守る** — 能力の一覧は全体（静的なので範囲の問題が無い）、
    チャンネルの一覧と接続の状態は**その関係の installation の分だけ**。
    接続の状態は受け持ちの件数を返さない（相乗りしている社数を全顧客に見せる値になる）
  - 鍵の追加は一意制約、失効は何度でも同じ結果になるので、二重の処理は自然に防がれる
  - **他の関係の情報が返らない**ことが試験で示される
  - _Requirements: 1.3, 1.4, 10.5, 11.1_
  - _Depends: 8.1, 7.3_
  - _Boundary: routes（鍵と読み取り）_

- [ ] 8.4 (P) ペアリングの申し込みの口を作る
  - **署名が無い唯一の口**なので、本文の検査を必ず通す
  - 2 度目の同じ申し込みには同じ結果を返す（新しい関係を作らない）
  - 署名が無くても、形の違う申し込みが断られることが試験で示される
  - _Requirements: 9.1, 9.2, 9.5_
  - _Depends: 5.4_
  - _Boundary: routes（ペアリング）_

- [ ] 8.5 チャットサービスから届く口を作り、この層の入口をまとめる
  - 折り返しを受けて installation を作る口（2 サービス分）
  - 外から接続を受けるサービスの受け口と、動作確認の口
  - **接続元を限定するために必要な情報**を運用者に示せる形にする
  - **この層の入口もここでまとめる**
  - 折り返しから installation が作られ、外から受けるサービスのイベントが届くことが試験で示される
  - _Requirements: 1.1, 13.3_
  - _Depends: 3.7, 7.1, 8.2, 8.3, 8.4_
  - _Boundary: routes（チャットサービス）_

- [ ] 9. プロセスとして動かす
- [ ] 9.1 起動と終了を作る
  - 設定を組み立てて各層へ引数で渡し、接続を回し始め、シグナルを受けて後始末する
  - **HTTP の口は常に開く。**GROWI から届く 8 つの口も折り返しも HTTP で受けるので、
    外から接続を受けるサービスを使うかどうかとは無関係である
    （**インターネットへ晒す必要があるのがそのサービスのときだけ**、という話と混同しない）
  - **設定ファイルから読む形の installation は起動時に作る**
  - プロセスが起動して 4 サービスの接続が張られ、終了時に後始末が走る
  - _Requirements: 1.1, 1.4, 8.1_
  - _Depends: 3.8, 8.5_

- [ ] 9.2 定期的に走る処理をまとめる
  - 期限切れの掃除・チャンネル一覧の取り直し・途中経過の掃除
  - **ロックを取って周期で回すのはここだけが持つ**（下の層は関数を用意するところまで）
  - 複数台で起動しても、同じ掃除と同じ取り直しが二重に走らないことが試験で示される
  - _Requirements: 2.5, 10.4, 11.5_
  - _Depends: 9.1, 2.2, 3.6_

- [ ] 10. 導入ドキュメントを書く
- [ ] 10.1 (P) サービスごとの事前準備を書く（4 本）
  - 運用者が事前に用意しておくものを、サービスごとに 1 本ずつ
  - **外から接続を受けるサービスの登録手順が最も重い**ので、そこを厚く書く
  - 4 本が揃い、それぞれ用意するものと取り方が書かれている
  - _Requirements: 1.5_
  - _Boundary: docs_

- [ ] 10.2 (P) 閉域で運用する場合の構成を書く
  - 構成図・必要な通信・proxy と GROWI の役割分担
  - **proxy が侵害された場合に閉域内の GROWI が受ける影響と、署名がそれをどう抑えるか**
    （umbrella の表をそのまま載せる。**署名で防げるものと防げないものを混ぜない**）
  - 全体のレート制限との関係（1 つの workspace の通信が 1 つの送り元に集中する点）
  - 2 つが揃い、侵害されたときにできることとできないことが区別して書かれている
  - _Requirements: 13.4, 13.5_
  - _Boundary: docs_

- [ ] 11. 通しで動くことを確かめる
- [ ] 11.1 通しの試験を回す土台を用意する
  - **偽の GROWI** — 署名を検証して応答を返す HTTP サーバ。実際の往復に使う
  - **偽のチャットサービス** — 4 サービス分のイベントを流し込み、投稿を受け取れるもの
  - **複数のプロセスを起動して止める仕組み**（持ち分の確認に使う）
  - **これが無いと 11.2〜11.5 のどれも書けない**
  - 偽の GROWI と 1 往復でき、偽のチャットサービスからイベントが 1 本届く
  - _Requirements: 1.1_
  - _Depends: 9.1, 1.2_

- [ ] 11.2 コマンドの流れを 4 サービスで確かめる
  - 入力欄が使えるサービス — 呼びかけ → ボタン → 入力欄 → ページ作成 → リンクが投稿される
  - 入力欄が使えないサービス — 呼びかけ → 番号つき一覧 → 呼びかけ付きの返信で選択 → 聞き返しでページ作成
  - 検索が 2 台の GROWI の結果を出典つきで返す
  - **外から接続を受けるサービス** — スラッシュコマンドが使えず入力欄が使えるという
    他と違う組み合わせを持つので、確かめる価値が最も高い
  - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 8.2, 13.2_
  - _Depends: 11.1_

- [ ] 11.3 通知と紐付けの流れを確かめる
  - **通知** — GROWI がページを保存 → 指定のチャンネルへ届く →
    1 つの宛先だけ失敗させて再送すると、成功した宛先には二重に投稿されない
  - **紐付け** — 紐付いていない利用者が書き込みを打つと案内が本人にだけ見える形で返り、
    紐付けを始めるコマンドでも同じ経路が使える
  - 通知は Gen 1 で最も使われている機能なので、コマンドの流れと同じだけ確かめる
  - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 7.3, 7.6_
  - _Depends: 11.1_

- [ ] 11.4 複数台で動かしたときの持ち分を確かめる
  - アプリごとに 1 本のサービスは、2 台起動しても張られる接続が 1 本だけであること
  - installation ごとのサービスは、1 つの installation につながるのが 1 台だけであること
  - 持ち主を止めると他方が引き取ること。**ロックが延長され続ける限り奪われない**こと
  - 掃除と取り直しが二重に走らないこと
  - _Requirements: 1.1, 1.4, 8.1_
  - _Depends: 11.1, 9.2_

- [ ] 11.5 紐付けと鍵の入れ替えを通しで確かめる
  - 登録コードの発行から成立まで、実際の HTTP を通して往復すること
  - **申告された URL が条件を外れるとき拒まれること。明示した宛先は 3 条件とも通ること**
  - 鍵の入れ替えで、届かない相手が 1 台あるうちは古い鍵が失効せず、
    相手を直して打ち直すと配り直して初めて失効すること
  - **対応表を持たない**こと — チャットのアカウントと GROWI ユーザーの対応を
    proxy がどこにも保存していないことを、保存の中身を見て確かめる
  - _Requirements: 7.8, 9.1, 9.2, 9.5, 9.7, 10.5, 10.6, 13.1_
  - _Depends: 11.1_

---

## Implementation Notes

- **1.1**: このアプリは `"type": "module"` + `tsc` ビルドなので、相対 import は拡張子（`.js`）を付けて書くこと（`apps/growi-vault-manager` と同じ形。`tsc` は import 文をそのまま出力し、Node は拡張子なしの相対 import を実行時に解決できない）。Biome の `useImportExtensions` はこのリポジトリで有効になっておらず、1.7 が担当するのは層の順序と Chat SDK の import 元の2点だけなので、拡張子の付け忘れを機械的に捕まえる仕組みは無い。1.3 以降、複数ファイル間の相対 import を書く最初のタスクから注意すること。
- **1.2**: PostgreSQL 18 系の公式 image は `PGDATA` を `/var/lib/postgresql/18/docker` に変更しており、image 自身の `VOLUME` 宣言も `/var/lib/postgresql/data` ではなく親の `/var/lib/postgresql`。旧来の慣習のまま `volumes: - /var/lib/postgresql/data` と書くと、コンテナ再作成のたびに実データが消える（マウント先が実際の書き込み先と一致しない）。`.devcontainer/compose.yml` の `postgres` サービスは `/var/lib/postgresql` を volume にしている。今後 PostgreSQL の major version を上げる際は、上げる先の公式 Dockerfile で `PGDATA`/`VOLUME` の記述を必ず確認すること。`@chat-adapter/state-pg` 用の接続は `CHAT_SDK_DATABASE_URL`（`?options=-c%20search_path%3Dchat_sdk` で `chat_sdk` schema を選択、`postgres-init` サービスが起動時に schema を作成）、アプリ自身の Prisma 用は `DATABASE_URL` と、あえて別名の環境変数にしている（`createPostgresState()` が `POSTGRES_URL`/`DATABASE_URL` を自動検出するため、同名だと衝突する）。1.4・2.1・2.2 などスキーマ/テーブルを扱うタスクはこの2つの接続文字列の使い分けを踏襲すること。現時点では devcontainer 未 rebuild のため `postgres` ホスト名が解決できず、`postgres-connectivity.integ.ts` の2件は `ENOTFOUND postgres` で red のまま — これは devcontainer rebuild 後に解消される想定の欠陥ではない red で、rebuild が完了し次第 green になることを確認すること。
- **1.3**: `src/types/` の型のうち、design.md の文面（interface 宣言やコード片）をそのまま写したのは `PlatformEvent` / `PlatformAppConfig` / `InstallationCredentials` / `OutboundMessage` / `HistoryOutcome` / `HistoryMessage` / `DistributedLock` / `FieldSpec` の8個。`Relation` / `Invocation` / `InteractionRef` / `TimeRange` / `ModalForm` の5個は design.md に interface 宣言が無く、`relation` 表の列や `ArgumentCollector.start` などの使われ方から逆算して導いたもの（レビューで design.md の全使用箇所と矛盾しないことを確認済み）。後続タスクでこれらの型にフィールドが足りないと分かった場合は、根拠が使われ方からの逆算であることを踏まえて素直に拡張してよい（並行する型を新設しないこと）。`Invocation` と `PlatformEvent` はいずれも workspace/installation を指す値を持たない（`PlatformEvent` は design.md の文面どおりのため）。`InstallationProvider.resolve` や `listChannels` がその値を必要とするので、1.4 以降でどちらかの型に足すか、別の経路で運ぶかを決めること。
- **1.4**: レビューで design.md 自体の欠けが見つかり、実装ではなく design.md 側を直した — `installation_channel` の主キー `(installation_id, channel_id)` だけでは「一度も一覧を取り直せていない installation」と「取り直したが 0 件だった installation」を区別できず、前者に `inventory-not-ready` ではなく `channel-not-in-installation` を誤って返しうる欠陥だった。修正として `installation.channels_synced_at`（nullable timestamptz）を design.md の Data Models 表と 917 行目付近の記述に追加し、schema.prisma にも反映済み（`NULL` = 一度も取り直していない、非 `NULL` かつ `installation_channel` に行が無い = 取り直して 0 件）。この列へ実際に書き込む処理（`listChannels()` 完了時の更新）は 1.4 の範囲外で、`ChannelDirectory`（task 2.2 など）が担当する。また `own_key` / `peer_key` / `channel_permission` / `pending_collection` / `processed_notification_target` → `relation` の外部キーは明示的な解除手順（design.md 1007〜1009 行）に合わせて `Restrict`、`request_nonce` → `relation` は自然失効に任せるため `Cascade`、`pairing_order` → `relation` は履歴として残すため `SetNull` — 後続タスクでこの表に外部キーを足す際は、解除時に「アプリが順番どおり消す」設計を DB 側の自動連鎖が迂回しないよう、この使い分けを踏襲すること。`InstallationStore.remove()`（installation 自体の削除、design.md 356・603行目）の子行削除順序は design.md 未記載 — task 2.1 以降で実装する際に design.md へ書き足すこと。移行 SQL は devcontainer 未 rebuild のため実 DB へ適用して確認できておらず、`prisma migrate diff --from-empty` によるオフライン生成との一致のみ確認済み。feature レベル検証で `pnpm run db:migrate` を実際に流すこと。
- **1.5**: `runtime/config.ts` は `SecretCipher`（`encrypt`/`decrypt` の2関数）を返し、鍵そのものはクロージャの外へ出さない。暗号方式は AES-256-GCM（毎回新しい12バイトIV、認証タグを保存・復号時に必ず検証）— 改ざんされた値や別の鍵で書かれた値を確実に拒む。鍵は `SECRET_ENCRYPTION_KEY`（32バイトを base64、未設定/長さ不正なら起動時に例外。値そのものはエラーメッセージに出さない）。`PlatformAppConfig` は `SLACK_*`/`DISCORD_*`/`TEAMS_*` のサービスごとの環境変数ブロックから全部揃うときだけ値を作り、一部欠けなら起動しない。閉域向けの許可宛先は `GROWI_ALLOWED_DESTINATIONS`（JSON配列、`{hostname, caCertPath?}`）で1か所にまとめ、`caCertPath` はあれば起動時にファイルの存在まで検査する。`normalizeHostname` は `packages/chat/src/url-guard/growi-uri-guard.ts` の同名処理の写しだが、`judgeGrowiUri` 自身も許可一覧を同じ手順で正規化するため食い違っても照合は壊れない — 将来 `packages/chat` を触る際は writable な形（export）にして写しを無くすのが望ましい。`loadConfig(env = process.env)` は env を引数化してあるので、`src` 全体で `process.env` を直接読むのはこのファイルだけという前提を後続タスクでも保つこと。「暗号鍵が無ければ起動しない」は `loadConfig` が例外を投げる形で担保されており、実際の起動処理（`runtime/server.ts` 等、task 9.1 以降）から呼ばれて初めてプロセス終了まで確認できる — 9.1 でこの呼び出しを配線すること。
- **1.6**: `CapabilityLevel`（`full`/`degraded`/`none`/`unverified`）は `@growi/chat` が公開しているので、`capabilities/` 側では再宣言せず import すること — round 1 で一度ローカル再宣言してしまい差し戻された。`CapabilityName`（proxy 固有の能力名の union）と `ConnectionUnit`（接続の単位）はこのアプリだけの語彙なので、こちらは `capabilities/index.ts` から通常どおり再 export してよい。能力表 36 セル（9能力×4サービス）は design.md の表と完全一致（要約からの再導出ではなく design.md 本体を直接読んで確認済み）。接続の単位・外部からの接続要否・管理者判定はそれぞれ独立したデータ構造として持ち、能力表とは混ぜていない。design.md 自体に「`linkPreview` も要確認の行」という誤記があり（実際は `full`/`none`/`none`/`none` で確定済み）、design.md 66行目とコード側コメントの両方を修正済み。
- **1.7**: `src/architecture.spec.ts` は正規表現で `src/**/*.ts` の import 文を抽出して層の順序と Chat SDK 境界を検査する（ASTパーサーではなく、biome の整形強制と組み合わせて成立する設計）。行をまたぐマッチ（`[^'"]*` が改行も食べてしまう）は、直後の行にあるコメントを import と誤認する実害があるので `[^'"\n]*` を必ず使うこと — round 1 で一度この誤りが混入し差し戻された。動的 import の引用符クラスにはバッククォートも含めること（`import(\`...\`)` は biome も拾わない唯一の抜け道）。この試験は `src/` 全体を歩くので、後続タスクが `db/`・`platform/`・`command/`・`relation/`・`growi/`・`orchestration/`・`routes/` を作った瞬間から自動的に対象になる（層の名前は design.md の依存の向きと完全一致させて `LAYER_ORDER` に列挙済み、後から編集不要）。未知のトップレベルディレクトリ（`generated/`・`runtime/` 以外）は自動的に違反として検出されるので、新しい非層ディレクトリを `src/` 直下に作る場合は `EXCLUDED_DIRS` へ追記すること。`src/` 直下に置いた単体ファイルは `runtime` 同様「最外殻」として層の検査から漏れるので、新しい層のファイルを誤って `src/` 直下に置かないこと。**2.1 で `src/generated/prisma`（Prisma クライアント生成物）が同じ理由で「最外殻」に落ち、`db/` からの import が誤検知された** — `generated/` を層順ガードでは読み飛ばし、代わりに「`generated/` は `db/` からしか import できない」という Chat SDK 境界と同種の独立ガードを追加して対処した。今後 `generated/` を触るタスクはこの前提を壊さないこと。
- **2.1**: `SecretCipher` 型は `runtime/config.ts` ではなく `types/secret-cipher.ts` に宣言し直した（`db/repositories` が `runtime/` を import すると層違反になるため、design.md 53行目の「repository が返す型は `types/` に置く」に従った）。`runtime/config.ts` は `types/` から import して再輸出するだけで、暗号処理自体は無変更。`own-key-repository.loadSigner(ref: KeyRef)` は `{ key, privateKey: KeyObject }` を返し（design.md 486行目の `signerFor` の形）、復号済み PEM 文字列や暗号文そのものを返す関数はどこにもない。`listKeys` は `select` で暗号化列自体を問い合わせから外している（後続タスクで一覧系の読み出しを書く際はこの形を手本にすること）。`own-key-repository`/`peer-key-repository` の鍵の参照はすべて `relationId`+`keyId` の複合キー（`KeyRef`）で行い、`keyId` 単独では引かないこと。鍵の入れ替え方針（入れ替え中どちらの鍵で署名するか）はこの層に持ち込まず `RelationKeyService`（4.x）に委ねた——`own-key-repository` は `issue`/`listKeys`/`loadSigner`/`markDeliveredToPeer`/`revoke` の部品を提供するのみ。`db/index.ts`・`db/repositories/index.ts`（入口の barrel）は 2.3 の担当なのでまだ作っていない。`src/generated/prisma` は `.gitignore` 済みで、チェックアウト直後は 1.4 の `channelsSyncedAt` 追加前の古い生成物が残っていることがある——このディレクトリに触れるタスクはまず `pnpm run db:generate` を走らせること。`InstallationStore.remove()`/`PairingService.unpair()` の子行削除順序は design.md 未記載のまま（1.4 からの持ち越し）——実装時に design.md へ書き足すこと。
- **2.2**: `request-nonce-repository.consumeNonce` は先に有無を調べてから挿入する形ではなく、主キー `(relation_id, key_id, nonce)` への `create` を直接試み、`Prisma.PrismaClientKnownRequestError` かつ `code === 'P2002'` のときだけ `false`（再送検知）を返し、それ以外の例外（接続断など）はそのまま投げ直す実装にすること — 競合を起こさず、かつ「本当に再送だった」と「DBが落ちていた」を取り違えない。`processed-notification-repository.upsertTarget` は `(relation_id, request_id, platform, channel_id)` の複合キーで1行だけを更新し、まとめて消して書き直す関数は作らない — `findAllForRequest` は `status` で絞らず全件返し、どれを再送するかは呼び出し側（4.x以降）が決める。`installation.channels_synced_at` の書き込み関数（`markChannelsSynced`）は `installation_channel` ではなく既存の `installation-repository.ts` に足す（列がそちらの表にあるため）。design.md 1004行目が期限切れ掃除の対象に挙げる4表（`request_nonce`・`processed_notification_target`・`pending_collection`・`pairing_order`）のうち `pairing_order` は task 2.1 の担当ファイルで、2.2 の境界（判定と途中経過）には含まれない — `pairing-order-repository.ts` に `deleteExpired` が無いまま残っているので、9.2（`runtime/sweeper.ts`）に入る前に追加すること。「1関係につき進行中のやり取りは1件だけ」（design.md 719行目）という不変条件は `pending_collection` の索引だけでは強制できない（一意制約ではなく索引のため複数行がありうる）— 守るのは `ArgumentCollector`（4.x）の役目で、この層は読み書きの部品だけを提供する。
- **2.3**: `db/` の公開窓口は2つ（`db/index.ts` と `db/repositories/index.ts`）——design.md のファイル構成図がどちらも「公開窓口」と明記しているため、どちらから import しても正当。以降の層（`platform/` 以降）は `db/index.ts`（推奨、`prisma-client.ts` のファクトリも含む）か `db/repositories/index.ts` のどちらかを使い、個々のリポジトリファイルや `prisma-client.ts` を直接 import しないこと——`architecture.spec.ts` の4つ目のガードがこれを機械的に強制する。`tsconfig` に `paths` 別名が増えたら、このガードは相対 import しか見ていないので素通りされる点に注意（現時点では `paths` 未使用）。
- **3.1**: `platform/index.ts`（`createPlatformFacade`）は 3.1 では作らない — tasks.md 3.8 が「この層の入口もここでまとめる」と明記しており、`PlatformFacade.connections()` が返す `ConnectionManager` は 3.8 が作るものなので、それ以前には存在しえない。3.1 が置くのは `adapter-set.ts`（4 サービスの構築を宣言した表 `ADAPTER_FACTORIES` と、それを引数で受け取る組み立て関数）と `bot-factory.ts`（`Chat` の生成と分散ロックの包み込み）の2つだけ。以降の 3.x は各自1ファイルを持ち、3.8 が束ねること。資格情報の出どころ（アプリごと／installation ごと）は `CONNECTION_UNIT_TABLE` から導出せず `ADAPTER_FACTORIES` に直接宣言している — Teams は接続の単位としては「常時接続を張らない」だがアプリ設定からアダプタを1つ組み立てるので、`CONNECTION_UNIT_TABLE` からの導出は軸が違う（今たまたま両立しているだけ）。**Slack は socket mode で `clientId`/`clientSecret` を渡すと例外になる**（`Multi-workspace (clientId/clientSecret) is not supported in socket mode`、`@chat-adapter/slack` の実コードで確認済み）— この2つは proxy 自身の OAuth 折り返し（`routes/install-routes.ts`）が使う値であって、アダプタには渡さない。`signingSecret` は渡す（socket の検証のためではなく、認証系の値を1つも渡さないとアダプタが `SLACK_BOT_TOKEN` 等を `process.env` から読んでしまう実装になっているため——実コードの `noAuthConfig` 判定で確認済み。Teams の `appTenantId` など一部のフィールドは installation ごとの値でありこの段階では渡しようがなく、SDK 内部で `process.env` を見にいく経路が完全には閉じられない点は残る）。Teams は `PlatformAppConfig.clientId`/`clientSecret` を SDK の `appId`/`appPassword` に読み替える。**`PostgresStateAdapter` は遅延接続しない**（`connect()` が解決するまで全メソッドが例外を投げる、実コードで確認済み）ので `createAppBot` は I/O を持たない組み立てだけに留め、接続は 3.8 の `createPlatformFacade`（design.md でこれが async な理由がこれ）が行う。分散ロックの鍵には `growi-proxy:` を前置している——`@chat-adapter/state-pg` の `chat_state_locks` は `(key_prefix, thread_id)` が主キーで、この app は state を1つしか作らないため SDK 自身のスレッドロックと同じ `key_prefix` の中に並ぶ（前置は `thread_id` 側での衝突回避）。`AppBot`（`bot-factory.ts`）は `state`/`bot` フィールドに Chat SDK の型（`PostgresStateAdapter`/`ChatInstance`）をそのまま持つ——`platform/` の中では問題ないが、`platform` は層順序で `command`/`routes` より左にあるため、3.8 が `platform/index.ts` を作る際に `AppBot`/`createAppBot`/`createInstallationBot` をそのまま re-export しないこと（SDK の型が他層から見える barrel の穴になる）。
- **3.2**: `InstallationProvider` は `InstallationRepository`（task 2.1、`db/` の barrel 経由）への薄い委譲のみ——`resolve` は `resolveCredentials`、`list` は `listByPlatform` をそのまま呼ぶだけで、復号・能力表の参照はどちらもこの層の仕事ではない。「あるべき接続の本数は installation の数では決まらない」という設計判断は `list()` の結果を使う側（`ConnectionManager`、task 3.8）が `CONNECTION_UNIT_TABLE` と組み合わせて行うもので、`InstallationProvider` 自身は `capabilities/**` を import しない。
- **3.3**: design.md 自体の誤りを修正した——`PlatformEvent` の `slash-command.interaction`/`action.interaction` は元は非nullable `InteractionRef` だったが、実際は `chat` の `SlashCommandEvent`/`ActionEvent` の `triggerId` がどのサービスでも省略可能（Slack だけが載せる。Teams は明示的に載せない、Discord は概念自体が無い）で、能力表では Discord の `slashCommand`/`interactiveActions` や Teams の `interactiveActions`/`modal` が `full` なので、非nullableのままだと「対応していると宣言しているのにイベントを1つも作れない」状態だった。design.md と `types/platform-event.ts` の両方を `InteractionRef | null` に修正済み。**この修正は `PlatformFacade.openModal(trigger: InteractionRef, ...)`（design.md）にも同じ食い違いが残っている**——Teams は `modal` が `full` なのに手がかりを載せないため、modal を開く後続タスクで対処が必要（「有効な手がかりがある」を `interaction != null` と実装してはならない。SDK 側はイベント自身の `openModal()` で開く）。`link-posted` は能力表を見ずにデータ形状だけで Slack 限定と判断してよい（`Message.links` を埋めるのは Slack アダプタだけ）。ボタンの `correlationId` は `encodeActionId()`/`decodeActionId()` の対で action id の中を通す——`outbound.ts`/`prompt.ts`（後続タスク）はこの関数を必ず呼び、同じ書式を手で組み立て直さないこと。modal の `correlationId` は `privateMetadata` に載せる（`callbackId` は静的な絞り込みキーで不可）。**bot 自身の投稿を除外するフィルタ（`author.isMe`）はこの層に無い**——`link-posted` は bot 自身が貼ったリンク予告で再発火しうる経路なので、SDK のハンドラ登録を行う task 3.8 の受け入れ条件にこのフィルタを明示的に含めること。
- **3.4**: design.md 自体の変更として `OutboundMessage.choice` に `correlationId: string`（必須）を足した——`event-mapping.ts` の `decodeActionId` はボタンの action id を解く以外に `correlationId` を取り出す経路が無いため、投稿後に messageId と対応づけて復元することができず、描画の時点（`outbound.ts` が `post()` を呼ぶとき）で correlation id が必要だった。`openModal(trigger, form, correlationId)` のように別引数で渡す前例が design.md に既にあったが、`post(target, message)` はそのような追加引数を持たないため、メッセージの一部として持たせる形を選んだ。**4.x（`ArgumentCollector`）は `choice` を投稿するとき必ず `correlationId` を渡すこと。** ボタンが使えないサービス（`interactiveActions` が `none` のサービス、現状 Mattermost）では答え方が変わる——`choice` は番号つきの markdown リストへ差し替わり、利用者は `@growi 1` のような呼びかけ付き返信で番号（`options` の並び順の1始まりの位置）を答える。この対応づけ（番号→選択肢）は `outbound.ts` の描画順そのものなので、4.x で `resume()` を実装する際はこの取り決めをそのまま踏襲すること（別の順序で選択肢を並べ直さない）。`list` の劣化判定は `card` 能力、`choice` の劣化判定は `interactiveActions` 能力で行う——`card` が `degraded`（Mattermost）でも、ボタンさえ効けば `choice` はそのまま使えるはずだが、実際は `interactiveActions` も `none` なのでどちらにせよ劣化する、という別軸の話であることに注意。3.8 が `platform/index.ts` を作る際、`outbound.ts` が公開する `post`/`postEphemeral`/`attachPreview`/`replace`/`OutboundContext`/`toPostable`/`channelThreadId` のうち、Chat SDK の型（`Adapter`/`StateAdapter`/`AdapterPostableMessage`）を引数や戻り値に持つものをそのまま re-export しないこと（3.1 の `AppBot` と同じ穴になる）。3.8 は `bot-factory.ts` の `BOT_USER_NAME`（現状ファイル内だけの定数）を export し、`OutboundContext.botName` に渡す配線も必要。能力表の見直し候補として、Discord の `ephemeralMessage` は `full` だが `@chat-adapter/discord` に `postEphemeral` の実装が無く DM への切り替えで成り立っている（一人にしか届かない点は満たすが、native ではない）。`postEphemeral` は `EphemeralMessage.id` が空文字になりうる SDK 仕様上、`{ ok: true, messageId: '' }` を返しうる——空の `messageId` から `MessageRef` を作る流れは design.md には無いため今は未対応のままでよいが、後続タスクで `replace()` をephemeralメッセージに使う設計が出てきたら要検討。
- **3.5**: **design.md 自体の食い違いを SDK の実装を読んで解いた。** `openModal(trigger: InteractionRef, ...)` の `trigger` は「サービスが渡してくる `trigger_id`」ではなく、**そのイベント自身の `openModal()` を指す手形**である。根拠は2つで、どちらか一方だけでもアダプタ直呼びは成立しない。(1) **Teams には `adapter.openModal` が無い**（4アダプタ中 Slack だけが実装。Teams は webhook 応答の中で返す `WebhookOptions.onOpenModal` 経由）ので、`trigger_id` を条件にすると `modal` が `full` のサービスで一度も開けない。(2) **SDK の `SlashCommandEvent.openModal` / `ActionEvent.openModal` は、開く前に `contextId` を発行して元のスレッド・チャンネルを state に保存する**（`chat/dist/index.js`）。送信された modal はこの `contextId` で会話が引き直されるので、自前で `adapter.openModal` を呼ぶと保存が行われず、**task 3.3 の `fromModalSubmit` が `relatedThread`/`relatedChannel` 無しで `null` を返し、送信された modal が全部捨てられる**。よって `platform/prompt.ts` に短命の手形置き場（`ModalTriggerRegistry`、既定 60 秒・使ったら消す・登録時に期限切れを掃除）を置き、`InteractionRef.token` はその鍵にした。`InteractionRef` の形（`{ token: string }`）は変えていない。置き場が in-memory でよいのは、`openModal` が「そのイベントを処理している最中に・同じ台で・手形の寿命の内側で」呼ばれるものだから（Slack の `trigger_id` は約3秒、Teams のハンドラ既定は5秒）。跨いで残る必要があるのは進行中のやり取りの方で、それは `pending_collection` に `correlationId`（modal の `privateMetadata` に載せる）で既に残る。
- **3.5（続き・後続タスクへの申し送り）**: 上に伴い **`event-mapping.ts` の `fromSlashCommand` / `fromAction` は `interaction: InteractionRef | null` を引数で受け取る形に変えた**（`event.triggerId` からは導出しない。導出すると Teams が必ず `null` になる）。手形を作って登録するのは **SDK のハンドラを登録する task 3.8** の仕事で、`registry.register(event.openModal)` の戻り値をそのまま渡すこと。**Teams については 3.8 だけでは足りない — `webhookHandler('teams')` が `chat.webhooks.teams(request, options)` に `onOpenModal` を渡さないと、Teams の modal は SDK が警告を出して黙って開かない**（受け入れ条件に含めること）。また、orchestration が「先に受け付けを返してから非同期で処理する」形にすると Teams は webhook 応答の窓を過ぎて開けなくなるので、modal を開く経路だけは応答を返す前に処理すること。`ModalOpener` / `ModalTriggerRegistry` は SDK の `ModalElement` を名前に持つので、3.1 の `AppBot`・3.4 の `OutboundContext` と同じく **`platform/index.ts` から re-export しないこと**。`openModal` の戻り値は design.md の `Promise<void>` から **`Promise<boolean>` に変えた**（design.md も修正済み）— design.md 自身が「手がかりが切れているなら聞き返しの経路へ落とす」と書いているのに、`void` では呼ぶ側がその分岐を判断できなかった。例外は投げず、開けなかったときは `false`。
- **3.5（続き・`FieldSpec` と履歴）**: **`FieldSpec` 1 つ = modal の入力欄 1 つ、欄の名前は `FieldSpec.name`**（Slack アダプタは `ModalSubmitEvent.values` を入力欄の id で引く）。`time-range` も 1 欄で、範囲は 1 つの文字列として書いてもらう — 聞き返しの経路は 1 つの問いに 1 つの答えしか作れないため、modal だけ 2 欄（開始日・終了日）にすると両経路で `values` の形が変わる。**4.x は範囲の文字列を解く処理を 1 つ書き、modal と聞き返しの両方でそれを使うこと**（design.md にも追記済み）。`ModalForm` は task 1.3 が置いた `{ title, fields }` のままで、拡張していない。`fetchHistory` は `fetchMessages`（スレッドの返信）ではなく **`fetchChannelMessages`（チャンネルの会話）** を使う。期間で絞る API はどのサービスにも無い（`FetchOptions` は `limit`/`cursor`/`direction` だけ）ので、新しい方から遡って、ページの最古の発言が `since` を跨いだ時点で止める。上限 20 ページ。**`unsupported` は現状どのアダプタでも起きない**（4つとも `fetchChannelMessages` を実装している）が、SDK が optional として型付けしているので実行時に見て返す形にした。認識できない失敗（接続断など）は握りつぶさずそのまま投げる — `HistoryOutcome` の失敗はどれも利用者に見せる `remedy` を持つ契約なので、`remedy` の無い失敗をそこへ押し込むと直す必要のない設定を直させることになる。
- **3.5（続き・境界外の修正）**: **task 3.4 の `outbound.ts` に、実際には一度も成立しない Slack の判定が入っていたので直した。** `classifyOutboundFailure` は `error.name === 'SlackApiError'` を見ていたが、**投稿処理が実際に投げるのはこの形ではない** — `@chat-adapter/slack` の `api.d.ts` には `callSlackApi` / `assertSlackOk` が投げる `SlackApiError` というクラスが実在する（`channels.ts` の Slack チャンネル一覧取得もこの2関数に依存している）が、投稿処理が使っている古い経路はそれを通らない。投稿処理の `handleSlackError` は rate limit だけを読み替えて、あとは `@slack/web-api` の素の `Error`（`name` は `'Error'`、`code: 'slack_webapi_platform_error'`、API の名前は `data.error`）をそのまま投げ直す。つまり **Slack の失敗は全部 `platform-error` に落ちていて、要件 1.4 / 2.4 が求める「bot を招待してください」が一度も出ない状態だった**（`outbound.spec.ts` がその存在しない形を自分で作って渡していたため気づかれていなかった）。修正として、認識の部分を `channelAccessFailure(error): 'not-in-channel' | 'not-permitted' | null` として `outbound.ts` から export し、`history.ts` はそれを自分の語彙に写す（`PostOutcome` と `HistoryOutcome` は失敗の種類が違うので、**写し方は共有せず、認識だけを共有する**）。サービスごとの意味の違いは `AdapterError.adapter` を見て分けている — Mattermost は bot がチャンネルに入っていないと 403 を返すので `PermissionError` は `not-in-channel`、Teams は membership ではなく Graph の権限で読むので同じクラスでも `not-permitted`。`classifyOutboundFailure` は `not-in-channel` だけを `bot-not-in-channel` に写す（`PostOutcome` の `remedy` は「招待してください」の一文なので、権限不足をそこへ入れると誤った指示になる）。`outbound.spec.ts` の作り物のエラー形も実物に合わせて直した。
- **3.5（続き・境界外の修正のレビュー対応。Discord の分類は変えていない）**: 上の Slack 修正のレビューで、**Discord の 403 / エラーコード 50001（"Missing Access"）が誤って `not-permitted` に分類され直っていたのを見つけて元に戻した**。Slack のバグ修正のついでに紛れ込んだ意図しない変更で、どこにも記録がなかった。**Discord では 403 / 50001 も `not-in-channel`（＝「bot をチャンネルに招待してください」）が正しい**。理由は Teams との違いにある — **Teams は Graph API の権限で読む**ので `PermissionError` は本当に権限不足（`not-permitted`）だが、**Discord はチャンネルへの参加状態で読む**ので、403 も 50001 も「bot がそのチャンネルに参加していない」という同じ事実を指しており、404（チャンネルが見えない）と区別する意味のある「権限だけ足りない」状態が存在しない。task 3.4（最初にこの分類を書いたタスク）の時点でも Discord の 403/50001 は `not-in-channel` だった。今回の対応でこれを維持し、`outbound.spec.ts` に `classifyOutboundFailure` を最後まで通した結合テスト（`PostOutcome.reason === 'bot-not-in-channel'`）を追加して、この事実が今後また分類の途中結果だけのテストで見落とされないようにした。**Slack・Mattermost・Teams の分類は今回変更していない。**
- **3.5（続き・`openModal` は capability を自分では確認しない）**: `platform/prompt.ts` の `openModal` は `supports(platform, 'modal')` を呼んでいない。design.md の前提「`openModal` を呼んでよいのは capability 表の `modal` が `full` で、かつ使える手がかり（`InteractionRef`）がある場合だけ」を守る責任は、modal 経路と聞き返しの経路のどちらを使うか決める側（4.x のコマンド・引数収集のオーケストレーション、あるいは 3.8）にある。`prompt.ts` は渡された `InteractionRef` をそのまま信頼して開こうとするだけで、呼び出し側の判断を検証しない。
- **3.5（続き・未確認の前提）**: `fetchHistory` の遡り方は「ページは新しい方から届く」ことを前提にしている。Slack・Discord・Teams は `direction` を読んで実際にそう返す（実コードで確認済み）が、**Mattermost のアダプタは `direction` を無視して番号でページを繰る**（`page=0,1,2…`、`nextCursor` は `String(page + 1)`）ため、この前提は「`/channels/{id}/posts` の page 0 が最新である」という**未確認の推測**の上に乗っている。逆だった場合、1 ページ目で打ち切り条件が成立して**過去の期間はどれも「発言 0 件」と答えてしまう**（失敗ではなく誤った答えなので気づきにくい）。**Mattermost の実接続で 1 度確かめること**（3.8 の配線後、または feature レベルの検証で）。確かめる方法は、過去に発言のあるチャンネルで期間を指定して `keep` を実行し、発言が返ることを見るだけでよい。
- **3.6**: `listChannels`（`platform/channels.ts`）は design.md には具体の呼び先が無く、実物の SDK/各サービスの REST API を読んで実装した。**「その workspace のチャンネルか」と「bot が入っているチャンネルか」を混同しないこと** — 一覧は前者にだけ答える。Slack は `conversations.list`（`public_channel,private_channel`）、Discord は `GET /guilds/{id}/channels`、Teams は tenant 全体の team を列挙して各 channels を取る。**Mattermost だけ2本の呼び出しが必要**（`GET /teams/{id}/channels` で公開チャンネル全部＋`GET /users/me/teams/{id}/channels` で bot が入っている非公開チャンネルを拾い、`channel_id` で重複除去）——1本だけだと bot 未招待の公開チャンネルが一覧から消え、投稿時に誤った案内（`channel-not-in-installation`＝チャンネルを作り直せ）になる。team の列挙自体（`GET /users/me/teams`）は bot 参加ベースにせざるを得ない（他に手段が無い、design.md の要求とは別問題）。**Mattermost の `GET /teams/{id}/channels` は `per_page` 既定60でページ分割される**（公式 OpenAPI 定義で確認済み）— `page`/`per_page=200` を明示してSlackと同じ「打ち切りは失敗として扱う」方針（`MAX_PAGES`/`TooManyPagesError`）で回すこと。同じ処理内の他2本（team 列挙・bot参加チャンネル）はページ分割が無い。失敗時（`listChannels` が投げたとき）は `installation_channel`/`channels_synced_at` のどちらにも書き込まないこと——最後に取れた一覧をそのまま使い続けるという design.md の指示を守るため。空の結果は失敗と区別し、`channels_synced_at` は結果によらず更新すること。取得できなくなったチャンネル（bot が外された等）の削除（pruning）は実装していない——design.md に指示が無く、残しておいても投稿時に正しい案内（`bot-not-in-channel`）に落ちるため実害がない。Discord の `isPrivate` は `@everyone` ロールへの `VIEW_CHANNEL` 拒否から推測している近似値で、カテゴリ単位の未同期の制限やロール限定の許可は拾えない（判定ロジックは変更不要、注釈で明記済み）。テストのモック `fetchStub` は呼び出し順で応答を返す作りなので、**新しいテストを足すときは必ず実際に要求された URL（`requests[N].url`）まで検査すること**——件数や中身だけの検査では、想定と違うエンドポイントを叩いていても偶然一致して見逃す（このタスクで実際に2回起きた）。
- **3.7**: `InstallationStore` は design.md 宣言どおり `save`/`remove` の2つだけ。**OAuth の折り返し（`routes/install-routes.ts`）と Mattermost の設定読み込み（`runtime/mattermost-installations.ts`）は3.7の範囲外**——この2つが呼ぶ側で、ここで作ったのは両方から呼ばれる関数だけ。design.md の欠けを2か所直した。**(1) `save()` 直後の取り直し（task 3.6 の `refreshChannelInventory`）が失敗したとき**の扱いが未記載だった → `save()` は installation の id を返して成功し、失敗は**省略できない引数 `onChannelRefreshFailed`**で呼ぶ側へ渡す（このアプリには logger が無いため関数で渡す形にした。巻き戻すと一時的な失敗のために Slack/Discord では OAuth をもう一度通ることになり、周期の取り直し（9.2）が安全網として存在するため巻き戻さない設計）。**(2) `InstallationStore.remove()` の子行削除順序**（1.4・2.1 からの持ち越し）を design.md に書き足した: 関係ごとに `own_key`→`peer_key`→`channel_permission`→`pending_collection`→`processed_notification_target`→その `relation` の行を**1つの関係を消し終えてから次へ**、その後 `pairing_order`（`installation_id` が `Restrict` で残って邪魔をする）→`installation_channel`（解除では消さないがここでは消す）→最後に `installation`。`request_nonce` は `Cascade` なので触らない。GROWI 選択中の `pending_collection`（`relation_id` が空）は installation への外部キーを持たず、関係の id からは辿れないため妨げにも消去対象にもならず `deleteExpired` の掃除に任せる。**1つのトランザクションにはしていない**（`platform/` に Prisma のクライアントを持ち込むと architecture.spec.ts のガード3・4に反するため）——`Restrict` により行が孤立せず、`remove()` は中断後にもう一度呼べば続きから終わる。`db/` に6つの削除の部品（own-key/peer-key/pending-collection/processed-notificationの`deleteByRelation`、pairing-order/installation-channelの`deleteByInstallation`）を足した——barrel（`db/index.ts`・`db/repositories/index.ts`）は無変更（既に export 済みの interface にメソッドを足しただけ）。`PairingService.unpair()`（5.x）は同じ関係1つ分の削除順に揃えること——共通化はそのときに `relation/` 側で行う（今は呼ぶ側が無く形が決まらないため保留）。**カスケード削除の試験は1本の配列に全呼び出しを記録して並び全体を比較する形にすること**（`toHaveBeenCalled()` の羅列はどの順番でも通り、実DBでは拒否される並びを見逃す——3.6と同じ教訓）。関係2件のケースを必ず含めること（1件では「関係ごとに消す」と「全部の子を消してから全部の関係を消す」が区別できない）。要件1.5（導入ドキュメント）はこのタスクでは満たせない——feature レベルの検証か導入ドキュメント作成の側で別途担当すること。
- **3.8**: `platform/index.ts`（`createPlatformFacade`）はこの層の入口として、3.1〜3.7 の成果物を組み立てる。**`InstallationStore` は `PlatformFacade` に含めない**（design.md のインタフェースに `save`/`remove` は無い——OAuth の折り返し・Mattermost の設定読み込みが直接 `InstallationStore` を呼ぶ）。**サービスごとに独立した `Chat` インスタンスを作る**（`Chat.ensureInitialized` は自分が持つ全アダプタを最初の webhook で一斉に遅延起動するため、1つの `Chat` にアプリごとの全アダプタを詰めると、例えば Teams への受信だけで Slack の socket が `app:slack` のロック無しに開いてしまう）。state（`@chat-adapter/state-pg`）は全 `Chat` で共有する1つのオブジェクトのままでよい——重複の取り除きは `state.setIfNotExists('dedupe:{adapter}:{messageId}')` を共有 state 側で行うため、`Chat` を分けても壊れない。**`bot-factory.ts` の `createAppBot`/`createInstallationBot` は使われなくなった**（`AppBot.bot: ChatInstance` にはハンドラ登録・webhook・adapter取得のいずれも無いため）——doc コメントで注記済み、削除・改修はこのタスクの範囲外のまま次にこのファイルを触る人へ持ち越し。SDK のハンドラ登録（`onNewMention`/`onSlashCommand`/`onAction`/`onModalSubmit`/リンク投稿）はここで行い、`event-mapping.ts` の純粋関数を経由して `sink.handle()` へ渡す。**bot 自身の投稿を除外するフィルタ（`author.isMe`）はここに実装した**（`event-mapping.ts` は文脈を持たない純粋関数なのでここでしか判定できない）。Teams の modal は `webhookOptionsFor('teams')` が `onOpenModal` を `chat.webhooks.teams(...)` へ渡し、`Promise.race` + `await` で応答を返す前に処理を終える。**再調整ループ（`reconcile()`）は `ConnectionManager` 自身が `setTimeout` の自己再armで駆動する**（`setInterval` だと前回の周回が終わる前に次が発火しうるため）。既定値は間隔20秒・ロック寿命60秒（3倍）。**「閉じてよいか」の判断と「ロックを延ばすか」の判断は別の集合で答えること**——installation 一覧の読み取りに失敗したサービスは、閉じる判断からは除外してよいが、既に持っているロックの延長は続けなければならない（1ラウンド目でこれを1つの除外集合にまとめてしまい、一覧が読めない間ロック延長が完全に止まって二重処理を招く欠陥として差し戻された）。指数バックオフと `failed` への遷移は必ずテストすること（見た目は動いていても検査が無いと空回りに気づけない）。**申し送り（後続タスクへ）**: (a) アプリごとに1本張るサービス（Slack/Discord）は本来 installation 一覧の有無に接続の存在を左右されないはずだが、現状の実装では一覧の読み取りに失敗すると（特に初回起動時、既存レコードが無い状態で）そのサービスのユニット自体が作られず、`status()` からそのサービスの行が完全に消える（ロック基盤が健全でも `installations` 側だけの障害で起きうる）。周期ごとに読み直すので自己修復し二重処理も起きないが、design.md が接続状態の外部表示を置いた動機（「見る手段が無いと、要件1.4を満たしているのか単に気づいていないのかを区別できない」）そのものに触れる隙間なので、次にこのファイルを触るときに解消すること。(b) `webhookHandler('slack')`（現状どの route からも呼ばれていない）は、呼ばれると `Chat.handleWebhook` 経由で `ensureInitialized` を踏み、Slack の `startSocketMode()` が既存の socket を閉じずに上書きするため、ロックを持たない台での呼び出しで閉じられない socket が残る可能性がある。8.x で Slack の webhook 受け口を実装する際、`capabilities/` の `REQUIRES_INBOUND_REACHABILITY`（Teams のみ true）を参照しつつこの経路を検討すること。(c) Mattermost の投稿は installation ごとの接続を持つ台でしか成立せず（`ChannelRef` が installation を名指ししないため）、1台で同じ installation の接続が複数開いていると宛先解決に失敗しうる——design.md との矛盾ではないが、installation ごとの接続に対する投稿の宛先解決を担当するタスクが未定。(d) Discord のアダプタは実際には Gateway 接続を一切開かない（`initialize()` は application id を解決するだけ）——`capabilities/platform-capabilities.ts` の `CONNECTION_UNIT_TABLE` が `app:discord` を持続接続として扱っている点は Revalidation Trigger 候補。(e) Teams の modal を実際に開く経路（`actionType: 'modal'` を持つボタンを描画するコード）は `outbound.ts`/`prompt.ts` にまだ存在しない——能力表の Teams `modal: full` は Revalidation Trigger 候補。(f) `createPlatformFacade` が繋いだ state を切る処理は無い（`stopAll()` は意図的に state を切らない——`locks()`/`post()` を `stopAll()` 後も使えるようにするため）——`runtime/server.ts`（9.x）がプロセス終了時の後始末を持つ必要がある。
- **4.1**: `CommandInvocation.normalize` は `PlatformEvent` の `mention`/`slash-command` の2種類だけを受け取る（`Extract<PlatformEvent, {kind: 'mention'|'slash-command'}>` で型により排他し、実行時分岐にしない）。**`event-mapping.ts`（task 3.3）は呼びかけの先頭のアドレストークン（`@growi`）を取り除かない**——`normalize` がこの1か所だけで取り除く（`splitFirstToken` をアドレス除去とコマンド名分割の2回適用）。`slash-command` 側は `command`/`text` が既に分離済みなので分割不要。コマンド名が空（呼びかけだけで何も続かない）でも例外を投げず空文字を返す——「コマンド名として解釈できるか」の判定は `CommandSet`（task 4.2）の仕事で、`normalize` 自身は正規化に徹する。`interaction` は入力の `PlatformEvent` からそのまま持ち越す。
- **4.2**: `CommandSet`（`command/command-set.ts`）は `CommandName`（`search`/`create-page`/`keep`/`help`/`link-preview`）を `@growi/chat` から import し、再宣言しない。**`link` はこの語彙に含めない**——紐付け開始は `CommandRequest` ではなく別契約 `AccountLinkStartRequest` で、`permissionCheckName` を `null`（文字列でなく本物の `null`）にすることで `channel_permission` に誤って行を作れないようにしている。網羅性の試験は `@growi/chat` の `COMMAND_NAMES` から一覧を導出しており、ハードコードした個数ではない。`search` の `limit`（既定10）は利用者から集める `FieldSpec` には含めず、`SEARCH_DEFAULT_LIMIT` という別定数で proxy 側だけが持つ。`create-page`/`keep` に `title` フィールドは無い（プロトコル契約の拡張が先に必要なため意図的に除外）。**このタスクは対象の決まり方（`targeting`: `all-permitted`/`exactly-one`/`url-match`/`all-paired-no-filter`）を宣言するだけで、実際の解決ロジック（`GrowiSelector`、`relation/growi-selection.ts`）は実装しない**——後続タスクの担当。
- **4.3**: `AdminCommandSet`（`command/admin-command-set.ts`）は5つの意図（`issue-pairing-code`/`unregister`/`set-search-weight`/`rotate-key`/`rotate-key-status`）を文字列から組み立てるだけで、実際の呼び出しは行わない（設計どおり `relation/`・`growi/` を import していないことを architecture guard で確認済み）。**管理者かどうかの判定に使う権限データ（role）は呼び出し側が渡す**——`PlatformFacade`（3.8）にはロール・権限を取得するメソッドが1つも無いため、`isWorkspaceAdmin(platform, actor)` の `actor` は必須引数にして「渡し忘れたら判定できてしまう」経路自体を作らなかった。**orchestration 層（7.x）でこのコマンドを実際に配線する人は、ロール情報をどこから取得するか（`PlatformFacade` にメソッドを足すか、別経路を用意するか）を先に決める必要がある**——これを決めないと管理者コマンドは呼び出せない。`register`/`rotate-key`/`rotate-key status` は前方一致や余分な語を許さず完全一致のみ（`"rotate-key stauts"` は `invalid` であって `rotate-key` へのフォールバックはしない）。`set-search-weight` の数値解釈（`finiteNumberOf`）は `Number(token)` + `Number.isFinite` を使い `0x10`→16 や `1e3`→1000 を受け入れる一方、値の範囲チェックは行わない——**`relation.search_weight` に書き込む側（5.x）が範囲検証を担当すること**。`ADMIN_CHECK_TABLE`（1.6）の4サービスの判定フィールド名（Slack: `is_admin`/`is_owner`、Discord: `ADMINISTRATOR`/`MANAGE_GUILD`、Mattermost: `system_admin`/`team_admin`、Teams: `owner`）はサービス間で重複が無いため、`AdminActorRoles` に `platform` フィールドを持たせなくても、呼び出し側がサービスを取り違えた場合は「許可されるべきでない判定が誤って通る」方向ではなく「本来通るべき判定が拒否される」方向にしか壊れない（fail-closed）。
