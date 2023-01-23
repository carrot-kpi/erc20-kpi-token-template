import { useEffect, useRef } from "react";

export function usePrevious<S>(value: S): S | null {
    const ref = useRef<S | null>(null);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current as S;
}
