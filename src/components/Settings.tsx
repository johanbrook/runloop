import { h } from '../deps';

export const Settings = () => {
    return (
        <section>
            <h1>Settings</h1>

            <p>
                <button class="btn w-full" onClick={() => window.location.reload()}>
                    Refresh app
                </button>
            </p>
        </section>
    );
};
