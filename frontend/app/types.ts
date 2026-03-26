export interface Component {
    part_num: string
    price?: number
    name: string
    package?: string
    tolerance?: number
    quantity: number
    voltage_rating?: number
    additional?: object
    storage_name?: string
    position?: string
    facility?: string
    supplier_name: string
}

export interface Resistor {
    part_num: string
    resistance: number
    composition?: string
    power?: string
}

export interface Capacitor {
    part_num: string
    capacitance: number
    temp_coeff?: string
    type?: string
}

export interface Diode {
    part_num: string
    vforward: number
    vreverse: number
    capacitance?: number
}

export interface Location {
    storage_name: string
    position: string
    facility: string
    type?: string
    label?: string
    last_updated?: string
}

export interface Courier {
    name: string
    code_format?: string
    website: string
    contact_email?: string
}

export interface Project {
    name: string
    created_at: string
    purpose?: string
    last_updated?: string
    storage_name?: string
    position?: string
    facility?: string
}

export interface Purchase {
    order_number: string
    price: number
    tracking_code?: string
    date_placed: string
    delivery_date?: string
    supplier: string
    courier?: string
}

export interface Supplier {
    name: string
    url: string
    country: string
    contact_email?: string
}

export interface Version {
    version_number: string
    title: string
    date: string
    snapshot: object
    created_by?: string
    project_name: string
}
