import { useState, useEffect } from '../deps.ts';

export const useHasMounted = () => {
    const [hasMounted, setHasMounted] = useState<boolean>(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    return hasMounted;
};
