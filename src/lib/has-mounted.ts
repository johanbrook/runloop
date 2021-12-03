import { useState, useEffect } from 'preact/hooks';

export const useHasMounted = () => {
    const [hasMounted, setHasMounted] = useState<boolean>(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    return hasMounted;
};
