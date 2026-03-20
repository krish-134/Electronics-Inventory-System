import { createContext } from "react"

export type Page = "Home" | "Components" | "Projects" | "Locations" | "Shipping" | "Settings"

export interface PageData {
    page: Page,
    setPage: (p: Page) => void
}

const PageContext = createContext<PageData>({ page: "Home", setPage: () => {} })

export default PageContext
