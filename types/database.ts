export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            drug_groups: {
                Row: {
                    id: string
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    created_at?: string
                }
            }
            drugs: {
                Row: {
                    id: string
                    name: string
                    unit: string
                    unit_price: number
                    image_url: string | null
                    group_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    unit: string
                    unit_price?: number
                    image_url?: string | null
                    group_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    unit?: string
                    unit_price?: number
                    image_url?: string | null
                    group_id?: string | null
                    created_at?: string
                }
            }
            templates: {
                Row: {
                    id: string
                    name: string
                    user_id: string | null
                    total_price: number | null
                    image_url: string | null
                    note: string | null
                    deleted_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    user_id?: string | null
                    total_price?: number | null
                    image_url?: string | null
                    note?: string | null
                    deleted_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    user_id?: string | null
                    total_price?: number | null
                    image_url?: string | null
                    note?: string | null
                    deleted_at?: string | null
                    created_at?: string
                }
            }
            template_items: {
                Row: {
                    id: string
                    template_id: string
                    drug_id: string
                    quantity: number
                    note: string | null
                    custom_price: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    template_id: string
                    drug_id: string
                    quantity?: number
                    note?: string | null
                    custom_price?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    template_id?: string
                    drug_id?: string
                    quantity?: number
                    note?: string | null
                    custom_price?: number | null
                    created_at?: string
                }
            },
            customers: {
                Row: {
                    id: string
                    name: string
                    phone: string
                    birth_year: number | null
                    medical_history: string | null
                    note: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    phone: string
                    birth_year?: number | null
                    medical_history?: string | null
                    note?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    phone?: string
                    birth_year?: number | null
                    medical_history?: string | null
                    note?: string | null
                    created_at?: string
                }
            },
            orders: {
                Row: {
                    id: string
                    user_id: string
                    customer_id: string | null
                    template_id: string | null
                    total_price: number
                    status: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    customer_id?: string | null
                    template_id?: string | null
                    total_price?: number
                    status?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    customer_id?: string | null
                    template_id?: string | null
                    total_price?: number
                    status?: string
                    created_at?: string
                }
            },
            order_items: {
                Row: {
                    id: string
                    order_id: string
                    drug_id: string
                    quantity: number
                    unit_price: number
                    note: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    drug_id: string
                    quantity?: number
                    unit_price?: number
                    note?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    drug_id?: string
                    quantity?: number
                    unit_price?: number
                    note?: string | null
                    created_at?: string
                }
            }
        }
    }
}
