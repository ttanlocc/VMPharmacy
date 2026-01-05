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
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    user_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    user_id?: string | null
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
                    created_at: string
                }
                Insert: {
                    id?: string
                    template_id: string
                    drug_id: string
                    quantity?: number
                    note?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    template_id?: string
                    drug_id?: string
                    quantity?: number
                    note?: string | null
                    created_at?: string
                }
            }
        }
    }
}
