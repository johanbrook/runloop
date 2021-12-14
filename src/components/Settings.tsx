import { h } from '../deps';
import { AppConf, fileOf } from '../model/state';

interface Props {
    onReset: () => void;
    appConf: AppConf;
    onImport: (appConf: AppConf) => void;
}

export const Settings = ({ onReset, appConf, onImport }: Props) => {
    const doExport = async () => {
        try {
            await navigator.share({
                title: 'Run data as JSON',
                files: [fileOf(appConf)],
            });
        } catch (ex) {
            if ((ex as DOMException).name == 'AbortError') return;
            alert(`Sharing failed. Reason: ${(ex as Error).message || ex}`);
            console.error(ex);
        }
    };

    const doImport = async (evt: Event) => {
        const { files } = evt.target as HTMLInputElement;

        if (!files || !files.length) {
            alert('Received no files.');
            return;
        }

        if (files.length > 1) {
            alert('Please only upload a single file, thanks.');
            return;
        }

        const file = files[0];

        if (file.type != 'application/json') {
            alert('Only JSON files, please.');
            return;
        }

        try {
            const json = JSON.parse(await file.text());
            // TODO Validate JSON blob
            onImport(json);
        } catch (ex) {
            console.error(ex);
            alert(`Failed to read "${file.name}". Reason: ${ex}`);
        }
    };

    const triggerImport = () => {
        document.getElementById('import-field')?.click();
    };

    const hasRuns = Object.values(appConf.runs).length > 0;

    return (
        <section>
            <h1>Settings</h1>

            <h3>Import & export</h3>

            <p>
                <button class="btn w-full block" onClick={doExport} disabled={!hasRuns}>
                    {!hasRuns ? 'No runs to export' : 'Export'}
                </button>
                <span class="detail inset-x my-4 inline-block">Export the locally stored run data.</span>
            </p>

            <p>
                <input
                    id="import-field"
                    type="file"
                    accept="application/json"
                    style="display: none"
                    onChange={doImport}
                />
                <button class="btn w-full block" onClick={triggerImport}>
                    Import
                </button>
                <span class="detail inset-x my-4 inline-block">
                    Import a JSON file after an export.
                    {hasRuns && ' Warning: this will overwrite any currently stored runs.'}
                </span>
            </p>

            <h3>Debug</h3>

            <p>
                <button class="btn w-full block" onClick={() => window.location.reload()}>
                    Reload app
                </button>
                <span class="detail inset-x my-4 inline-block">
                    No app data or current state will be deleted.
                </span>
            </p>

            <h3>Danger zone</h3>
            <p>
                <button
                    class="btn btn-danger w-full"
                    onClick={() => {
                        if (confirm('Are you sure?')) {
                            onReset();
                        }
                    }}
                >
                    Reset app data
                </button>
            </p>
        </section>
    );
};
