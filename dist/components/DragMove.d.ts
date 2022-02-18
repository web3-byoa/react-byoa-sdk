declare function DragMove(props: any): JSX.Element;
declare namespace DragMove {
    var defaultProps: {
        onPointerDown: () => void;
        onPointerUp: () => void;
        onPointerMove: () => void;
    };
}
export default DragMove;
