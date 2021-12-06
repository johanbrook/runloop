import { h, ComponentChildren } from '../deps';
import { Pathname } from '../lib/paths';
import { useRouter } from '../router';

interface Props {
    to: Pathname;
    children: ComponentChildren;
}

export const Link = ({ to, children, ...rest }: Props & preact.JSX.HTMLAttributes<HTMLAnchorElement>) => {
    const { navigate } = useRouter();

    const onClick = (evt: MouseEvent) => {
        evt.preventDefault();

        navigate(to);
    };

    return (
        <a href={to} onClick={onClick} {...rest}>
            {children}
        </a>
    );
};
