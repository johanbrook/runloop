import { h } from '../deps';

interface Props {
    onReset: () => void;
}

export const Settings = ({ onReset }: Props) => {
    return (
        <section>
            <h1>Settings</h1>

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
