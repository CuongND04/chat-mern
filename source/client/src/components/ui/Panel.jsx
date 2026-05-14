import { cn } from "../../lib/cn";

const Panel = ({ as: Component = "div", className = "", children, elevated = false, ...props }) => {
  return (
    <Component
      className={cn(
        "panel-surface rounded-[var(--radius-lg)]",
        elevated ? "shadow-[var(--shadow-md)]" : "",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Panel;
