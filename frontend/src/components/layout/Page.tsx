import type React from "react"
import type { Page as PageType } from "../../PageContext"
import { useContext, type PropsWithChildren } from "react"
import PageContext from "../../PageContext"

interface PageProps {
    page: PageType
}

const Page: React.FC<PropsWithChildren<PageProps>> = ({ page, children }) => {
    const { page: currentPage } = useContext(PageContext)
    return currentPage === page ? (
        <>{children}</>
    ) : (
        <></>
    )
}

export default Page
