export interface SolidAddress {
    locality: string
    country_name: string
    region: string
    street: string
}

export interface SolidProfile {
    address: SolidAddress
    company: string
    email: string
    fn: string
    image: string
    phone: string
    role: string
    organization?: string
}
