// If wallet is connect, render explore creator button
const ExploreButton = (props) => (
    <button className="button gradient-button" onClick={() => {
            props.onClick();
        }}>
        Explore Creators
    </button>
);

export default ExploreButton;