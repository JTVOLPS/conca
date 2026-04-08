export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      orgs: {
        Row: {
          id: string;
          name: string;
          slug: string;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          id: string;
          org_id: string;
          role: "owner" | "admin" | "member";
          full_name: string;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          org_id: string;
          role: "owner" | "admin" | "member";
          full_name: string;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          role?: "owner" | "admin" | "member";
          full_name?: string;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_profiles_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
        ];
      };
      invitations: {
        Row: {
          id: string;
          org_id: string;
          email: string;
          role: "admin" | "member";
          invited_by: string;
          accepted_at: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          email: string;
          role: "admin" | "member";
          invited_by: string;
          accepted_at?: string | null;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          email?: string;
          role?: "admin" | "member";
          invited_by?: string;
          accepted_at?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invitations_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invitations_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      contacts: {
        Row: {
          id: string;
          org_id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          mobile: string | null;
          title: string | null;
          type:
            | "broker"
            | "lender"
            | "investor"
            | "attorney"
            | "property_manager"
            | "contractor"
            | "tenant"
            | "partner"
            | "other"
            | null;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          country: string | null;
          notes: string | null;
          tags: string[];
          source: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          mobile?: string | null;
          title?: string | null;
          type?:
            | "broker"
            | "lender"
            | "investor"
            | "attorney"
            | "property_manager"
            | "contractor"
            | "tenant"
            | "partner"
            | "other"
            | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          country?: string | null;
          notes?: string | null;
          tags?: string[];
          source?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          phone?: string | null;
          mobile?: string | null;
          title?: string | null;
          type?:
            | "broker"
            | "lender"
            | "investor"
            | "attorney"
            | "property_manager"
            | "contractor"
            | "tenant"
            | "partner"
            | "other"
            | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          country?: string | null;
          notes?: string | null;
          tags?: string[];
          source?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contacts_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contacts_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      companies: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          type:
            | "brokerage"
            | "lender"
            | "investor"
            | "developer"
            | "property_manager"
            | "law_firm"
            | "title_company"
            | "insurance"
            | "contractor"
            | "other"
            | null;
          website: string | null;
          phone: string | null;
          email: string | null;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          country: string | null;
          notes: string | null;
          tags: string[];
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          type?:
            | "brokerage"
            | "lender"
            | "investor"
            | "developer"
            | "property_manager"
            | "law_firm"
            | "title_company"
            | "insurance"
            | "contractor"
            | "other"
            | null;
          website?: string | null;
          phone?: string | null;
          email?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          country?: string | null;
          notes?: string | null;
          tags?: string[];
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          type?:
            | "brokerage"
            | "lender"
            | "investor"
            | "developer"
            | "property_manager"
            | "law_firm"
            | "title_company"
            | "insurance"
            | "contractor"
            | "other"
            | null;
          website?: string | null;
          phone?: string | null;
          email?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          country?: string | null;
          notes?: string | null;
          tags?: string[];
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "companies_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "companies_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_companies: {
        Row: {
          id: string;
          contact_id: string;
          company_id: string;
          role: string | null;
          is_primary: boolean;
          started_at: string | null;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          contact_id: string;
          company_id: string;
          role?: string | null;
          is_primary?: boolean;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          contact_id?: string;
          company_id?: string;
          role?: string | null;
          is_primary?: boolean;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contact_companies_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contact_companies_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      interactions: {
        Row: {
          id: string;
          org_id: string;
          contact_id: string | null;
          company_id: string | null;
          deal_id: string | null;
          type:
            | "call"
            | "email"
            | "meeting"
            | "note"
            | "site_visit"
            | "other";
          subject: string | null;
          body: string | null;
          occurred_at: string;
          logged_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          contact_id?: string | null;
          company_id?: string | null;
          deal_id?: string | null;
          type:
            | "call"
            | "email"
            | "meeting"
            | "note"
            | "site_visit"
            | "other";
          subject?: string | null;
          body?: string | null;
          occurred_at?: string;
          logged_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          contact_id?: string | null;
          company_id?: string | null;
          deal_id?: string | null;
          type?:
            | "call"
            | "email"
            | "meeting"
            | "note"
            | "site_visit"
            | "other";
          subject?: string | null;
          body?: string | null;
          occurred_at?: string;
          logged_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interactions_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interactions_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interactions_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interactions_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interactions_logged_by_fkey";
            columns: ["logged_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      properties: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          asset_class:
            | "ios"
            | "marina"
            | "hospitality"
            | "multifamily"
            | "transitional"
            | "other";
          status:
            | "active"
            | "under_contract"
            | "closed"
            | "disposed"
            | "watch_list";
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          county: string | null;
          country: string | null;
          latitude: number | null;
          longitude: number | null;
          year_built: number | null;
          total_sf: number | null;
          lot_size_acres: number | null;
          num_units: number | null;
          zoning: string | null;
          parcel_number: string | null;
          custom_fields: Json;
          notes: string | null;
          tags: string[];
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          asset_class:
            | "ios"
            | "marina"
            | "hospitality"
            | "multifamily"
            | "transitional"
            | "other";
          status?:
            | "active"
            | "under_contract"
            | "closed"
            | "disposed"
            | "watch_list";
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          county?: string | null;
          country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          year_built?: number | null;
          total_sf?: number | null;
          lot_size_acres?: number | null;
          num_units?: number | null;
          zoning?: string | null;
          parcel_number?: string | null;
          custom_fields?: Json;
          notes?: string | null;
          tags?: string[];
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          asset_class?:
            | "ios"
            | "marina"
            | "hospitality"
            | "multifamily"
            | "transitional"
            | "other";
          status?:
            | "active"
            | "under_contract"
            | "closed"
            | "disposed"
            | "watch_list";
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          county?: string | null;
          country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          year_built?: number | null;
          total_sf?: number | null;
          lot_size_acres?: number | null;
          num_units?: number | null;
          zoning?: string | null;
          parcel_number?: string | null;
          custom_fields?: Json;
          notes?: string | null;
          tags?: string[];
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "properties_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      deals: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          asset_class:
            | "ios"
            | "marina"
            | "hospitality"
            | "multifamily"
            | "transitional"
            | "other";
          stage:
            | "sourcing"
            | "loi"
            | "under_contract"
            | "due_diligence"
            | "closed"
            | "dead";
          stage_position: number;
          stage_changed_at: string;
          sourced_at: string | null;
          loi_submitted_at: string | null;
          loi_accepted_at: string | null;
          contract_date: string | null;
          due_diligence_start: string | null;
          due_diligence_end: string | null;
          closing_date: string | null;
          dead_at: string | null;
          dead_reason: string | null;
          lead_broker_id: string | null;
          lead_source: string | null;
          property_id: string | null;
          custom_fields: Json;
          description: string | null;
          notes: string | null;
          tags: string[];
          assigned_to: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          asset_class:
            | "ios"
            | "marina"
            | "hospitality"
            | "multifamily"
            | "transitional"
            | "other";
          stage?:
            | "sourcing"
            | "loi"
            | "under_contract"
            | "due_diligence"
            | "closed"
            | "dead";
          stage_position?: number;
          stage_changed_at?: string;
          sourced_at?: string | null;
          loi_submitted_at?: string | null;
          loi_accepted_at?: string | null;
          contract_date?: string | null;
          due_diligence_start?: string | null;
          due_diligence_end?: string | null;
          closing_date?: string | null;
          dead_at?: string | null;
          dead_reason?: string | null;
          lead_broker_id?: string | null;
          lead_source?: string | null;
          property_id?: string | null;
          custom_fields?: Json;
          description?: string | null;
          notes?: string | null;
          tags?: string[];
          assigned_to?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          asset_class?:
            | "ios"
            | "marina"
            | "hospitality"
            | "multifamily"
            | "transitional"
            | "other";
          stage?:
            | "sourcing"
            | "loi"
            | "under_contract"
            | "due_diligence"
            | "closed"
            | "dead";
          stage_position?: number;
          stage_changed_at?: string;
          sourced_at?: string | null;
          loi_submitted_at?: string | null;
          loi_accepted_at?: string | null;
          contract_date?: string | null;
          due_diligence_start?: string | null;
          due_diligence_end?: string | null;
          closing_date?: string | null;
          dead_at?: string | null;
          dead_reason?: string | null;
          lead_broker_id?: string | null;
          lead_source?: string | null;
          property_id?: string | null;
          custom_fields?: Json;
          description?: string | null;
          notes?: string | null;
          tags?: string[];
          assigned_to?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deals_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_lead_broker_id_fkey";
            columns: ["lead_broker_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      deal_economics: {
        Row: {
          id: string;
          deal_id: string;
          org_id: string;
          asking_price: number | null;
          offer_price: number | null;
          purchase_price: number | null;
          price_per_unit: number | null;
          price_per_sf: number | null;
          noi: number | null;
          gross_revenue: number | null;
          occupancy_pct: number | null;
          cap_rate_in: number | null;
          cap_rate_out: number | null;
          loan_amount: number | null;
          ltv: number | null;
          interest_rate: number | null;
          loan_term_months: number | null;
          lender_id: string | null;
          irr_target: number | null;
          equity_multiple: number | null;
          cash_on_cash: number | null;
          total_equity: number | null;
          sponsor_equity: number | null;
          lp_equity: number | null;
          closing_costs: number | null;
          capex_budget: number | null;
          hold_period_months: number | null;
          custom_fields: Json;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          deal_id: string;
          org_id: string;
          asking_price?: number | null;
          offer_price?: number | null;
          purchase_price?: number | null;
          price_per_unit?: number | null;
          price_per_sf?: number | null;
          noi?: number | null;
          gross_revenue?: number | null;
          occupancy_pct?: number | null;
          cap_rate_in?: number | null;
          cap_rate_out?: number | null;
          loan_amount?: number | null;
          ltv?: number | null;
          interest_rate?: number | null;
          loan_term_months?: number | null;
          lender_id?: string | null;
          irr_target?: number | null;
          equity_multiple?: number | null;
          cash_on_cash?: number | null;
          total_equity?: number | null;
          sponsor_equity?: number | null;
          lp_equity?: number | null;
          closing_costs?: number | null;
          capex_budget?: number | null;
          hold_period_months?: number | null;
          custom_fields?: Json;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          deal_id?: string;
          org_id?: string;
          asking_price?: number | null;
          offer_price?: number | null;
          purchase_price?: number | null;
          price_per_unit?: number | null;
          price_per_sf?: number | null;
          noi?: number | null;
          gross_revenue?: number | null;
          occupancy_pct?: number | null;
          cap_rate_in?: number | null;
          cap_rate_out?: number | null;
          loan_amount?: number | null;
          ltv?: number | null;
          interest_rate?: number | null;
          loan_term_months?: number | null;
          lender_id?: string | null;
          irr_target?: number | null;
          equity_multiple?: number | null;
          cash_on_cash?: number | null;
          total_equity?: number | null;
          sponsor_equity?: number | null;
          lp_equity?: number | null;
          closing_costs?: number | null;
          capex_budget?: number | null;
          hold_period_months?: number | null;
          custom_fields?: Json;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deal_economics_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: true;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_economics_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_economics_lender_id_fkey";
            columns: ["lender_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      deal_contacts: {
        Row: {
          id: string;
          deal_id: string;
          contact_id: string;
          role: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          deal_id: string;
          contact_id: string;
          role?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          deal_id?: string;
          contact_id?: string;
          role?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deal_contacts_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_contacts_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
        ];
      };
      deal_stage_history: {
        Row: {
          id: string;
          deal_id: string;
          org_id: string;
          from_stage: string | null;
          to_stage: string;
          changed_by: string;
          changed_at: string;
        };
        Insert: {
          id?: string;
          deal_id: string;
          org_id: string;
          from_stage?: string | null;
          to_stage: string;
          changed_by: string;
          changed_at?: string;
        };
        Update: {
          id?: string;
          deal_id?: string;
          org_id?: string;
          from_stage?: string | null;
          to_stage?: string;
          changed_by?: string;
          changed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deal_stage_history_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_stage_history_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_stage_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      deal_field_definitions: {
        Row: {
          id: string;
          asset_class: string;
          field_key: string;
          field_label: string;
          field_type:
            | "text"
            | "number"
            | "boolean"
            | "date"
            | "select"
            | "textarea";
          options: Json | null;
          display_order: number;
          is_required: boolean;
          section: string | null;
        };
        Insert: {
          id?: string;
          asset_class: string;
          field_key: string;
          field_label: string;
          field_type:
            | "text"
            | "number"
            | "boolean"
            | "date"
            | "select"
            | "textarea";
          options?: Json | null;
          display_order?: number;
          is_required?: boolean;
          section?: string | null;
        };
        Update: {
          id?: string;
          asset_class?: string;
          field_key?: string;
          field_label?: string;
          field_type?:
            | "text"
            | "number"
            | "boolean"
            | "date"
            | "select"
            | "textarea";
          options?: Json | null;
          display_order?: number;
          is_required?: boolean;
          section?: string | null;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          org_id: string;
          storage_path: string;
          file_name: string;
          file_size: number | null;
          mime_type: string | null;
          entity_type: "deal" | "property" | "contact" | "company";
          entity_id: string;
          category: string | null;
          tags: string[];
          version: number;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          storage_path: string;
          file_name: string;
          file_size?: number | null;
          mime_type?: string | null;
          entity_type: "deal" | "property" | "contact" | "company";
          entity_id: string;
          category?: string | null;
          tags?: string[];
          version?: number;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          storage_path?: string;
          file_name?: string;
          file_size?: number | null;
          mime_type?: string | null;
          entity_type?: "deal" | "property" | "contact" | "company";
          entity_id?: string;
          category?: string | null;
          tags?: string[];
          version?: number;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          id: string;
          org_id: string;
          title: string;
          description: string | null;
          status: "todo" | "in_progress" | "done" | "cancelled";
          priority: "low" | "medium" | "high" | "urgent";
          due_date: string | null;
          entity_type:
            | "deal"
            | "property"
            | "contact"
            | "company"
            | null;
          entity_id: string | null;
          assigned_to: string | null;
          created_by: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          title: string;
          description?: string | null;
          status?: "todo" | "in_progress" | "done" | "cancelled";
          priority?: "low" | "medium" | "high" | "urgent";
          due_date?: string | null;
          entity_type?:
            | "deal"
            | "property"
            | "contact"
            | "company"
            | null;
          entity_id?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          title?: string;
          description?: string | null;
          status?: "todo" | "in_progress" | "done" | "cancelled";
          priority?: "low" | "medium" | "high" | "urgent";
          due_date?: string | null;
          entity_type?:
            | "deal"
            | "property"
            | "contact"
            | "company"
            | null;
          entity_id?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {};
    Functions: {
      global_search: {
        Args: {
          search_query: string;
          result_limit?: number;
        };
        Returns: {
          id: string;
          entity_type: string;
          title: string;
          subtitle: string;
          rank: number;
        }[];
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
};
