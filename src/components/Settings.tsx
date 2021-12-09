import { h } from '../deps';

interface Props {
    onReset: () => void;
}

export const Settings = ({ onReset }: Props) => {
    return (
        <section>
            <h1>Settings</h1>

            <p>
                <button class="btn w-full" onClick={() => window.location.reload()}>
                    Refresh app
                </button>
            </p>

            <p>
                <button
                    class="btn w-full"
                    onClick={() => {
                        if (confirm('Are you sure?')) {
                            onReset();
                        }
                    }}
                >
                    Reset
                </button>
            </p>
        </section>
    );
};
