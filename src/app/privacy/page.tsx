export default function Privacy() {
    return (
        <div className="min-h-screen p-8 bg-gray-900 text-gray-300 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">プライバシーポリシー</h1>

            <div className="space-y-4">
                <section>
                    <h2 className="text-xl font-semibold text-white mb-2">1. 収集する情報</h2>
                    <p>本サービスは、ユーザーの個人情報やファイルをサーバーに送信・収集することはありません。すべての処理はユーザーのデバイス（ブラウザ）内で完結します。</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-2">2. データへのアクセス</h2>
                    <p>本サービスにおいてユーザーがドラッグ&ドロップしたファイルは、名前の変更とZIP圧縮のために一時的にブラウザのメモリ上で処理されますが、外部に送信されることはありません。</p>
                </section>

                <div className="pt-8 border-t border-gray-800">
                    <a href="/" className="text-blue-400 hover:underline">← アプリに戻る</a>
                </div>
            </div>
        </div>
    );
}
