export default function Terms() {
    return (
        <div className="min-h-screen p-8 bg-gray-900 text-gray-300 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">利用規約</h1>

            <div className="space-y-4">
                <section>
                    <h2 className="text-xl font-semibold text-white mb-2">1. はじめに</h2>
                    <p>本規約は、MV Footage Dispatcher（以下「本サービス」）の利用条件を定めるものです。</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-2">2. サービスの提供</h2>
                    <p>本サービスは、ユーザーのブラウザ上で動画ファイルの整理・リネームを行うツールです。アップロードされたファイルがサーバーに送信・保存されることはありません。</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-2">3. 免責事項</h2>
                    <p>本サービスを利用して発生したいかなる損害（データの消失など）についても、開発者は一切の責任を負いません。必ず元のデータのバックアップをとった上でご利用ください。</p>
                </section>

                <div className="pt-8 border-t border-gray-800">
                    <a href="/" className="text-blue-400 hover:underline">← アプリに戻る</a>
                </div>
            </div>
        </div>
    );
}
