import {
    type RouteConfig,
    route,
    layout,
    index,
    prefix
} from "@react-router/dev/routes"

export default [
    index("routes/home.tsx"),
    route("components", "routes/components.tsx"),
    route("projects", "routes/projects.tsx"),
    route("locations", "routes/locations.tsx"),
    route("shipping", "routes/shipping.tsx"),
    route("settings", "routes/settings.tsx")
    
] satisfies RouteConfig;
