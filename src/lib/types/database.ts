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
          notes: string | null;
          updated_at: string;
          document_group_id: string;
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
          notes?: string | null;
          updated_at?: string;
          document_group_id: string;
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
          notes?: string | null;
          updated_at?: string;
          document_group_id?: string;
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
          position: number;
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
          position?: number;
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
          position?: number;
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
      tenants: {
        Row: {
          id: string;
          org_id: string;
          property_id: string;
          name: string;
          contact_id: string | null;
          unit_label: string | null;
          status:
            | "active"
            | "expired"
            | "month_to_month"
            | "vacating"
            | "vacated";
          occupied_sf: number | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          property_id: string;
          name: string;
          contact_id?: string | null;
          unit_label?: string | null;
          status?:
            | "active"
            | "expired"
            | "month_to_month"
            | "vacating"
            | "vacated";
          occupied_sf?: number | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          property_id?: string;
          name?: string;
          contact_id?: string | null;
          unit_label?: string | null;
          status?:
            | "active"
            | "expired"
            | "month_to_month"
            | "vacating"
            | "vacated";
          occupied_sf?: number | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenants_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tenants_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tenants_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tenants_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      leases: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string;
          property_id: string;
          lease_type:
            | "gross"
            | "modified_gross"
            | "nnn"
            | "percentage"
            | "ground"
            | "month_to_month"
            | "other";
          start_date: string;
          end_date: string | null;
          rent_amount: number | null;
          rent_frequency: "monthly" | "quarterly" | "annually";
          rent_escalation_pct: number | null;
          rent_escalation_date: string | null;
          security_deposit: number | null;
          cam_charges: number | null;
          free_rent_months: number | null;
          renewal_option_terms: string | null;
          early_termination_terms: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          tenant_id: string;
          property_id: string;
          lease_type:
            | "gross"
            | "modified_gross"
            | "nnn"
            | "percentage"
            | "ground"
            | "month_to_month"
            | "other";
          start_date: string;
          end_date?: string | null;
          rent_amount?: number | null;
          rent_frequency?: "monthly" | "quarterly" | "annually";
          rent_escalation_pct?: number | null;
          rent_escalation_date?: string | null;
          security_deposit?: number | null;
          cam_charges?: number | null;
          free_rent_months?: number | null;
          renewal_option_terms?: string | null;
          early_termination_terms?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          tenant_id?: string;
          property_id?: string;
          lease_type?:
            | "gross"
            | "modified_gross"
            | "nnn"
            | "percentage"
            | "ground"
            | "month_to_month"
            | "other";
          start_date?: string;
          end_date?: string | null;
          rent_amount?: number | null;
          rent_frequency?: "monthly" | "quarterly" | "annually";
          rent_escalation_pct?: number | null;
          rent_escalation_date?: string | null;
          security_deposit?: number | null;
          cam_charges?: number | null;
          free_rent_months?: number | null;
          renewal_option_terms?: string | null;
          early_termination_terms?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leases_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leases_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leases_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      operating_statements: {
        Row: {
          id: string;
          org_id: string;
          property_id: string;
          period_year: number;
          period_month: number;
          category: "revenue" | "operating_expense" | "capital_expense";
          line_item: string;
          actual_amount: number | null;
          budget_amount: number | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          property_id: string;
          period_year: number;
          period_month: number;
          category: "revenue" | "operating_expense" | "capital_expense";
          line_item: string;
          actual_amount?: number | null;
          budget_amount?: number | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          property_id?: string;
          period_year?: number;
          period_month?: number;
          category?: "revenue" | "operating_expense" | "capital_expense";
          line_item?: string;
          actual_amount?: number | null;
          budget_amount?: number | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "operating_statements_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "operating_statements_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "operating_statements_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      capex_projects: {
        Row: {
          id: string;
          org_id: string;
          property_id: string;
          deal_id: string | null;
          name: string;
          status:
            | "planned"
            | "in_progress"
            | "completed"
            | "on_hold"
            | "cancelled";
          budget_amount: number | null;
          spent_amount: number | null;
          start_date: string | null;
          target_completion_date: string | null;
          actual_completion_date: string | null;
          contractor: string | null;
          contractor_contact_id: string | null;
          description: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          property_id: string;
          deal_id?: string | null;
          name: string;
          status?:
            | "planned"
            | "in_progress"
            | "completed"
            | "on_hold"
            | "cancelled";
          budget_amount?: number | null;
          spent_amount?: number | null;
          start_date?: string | null;
          target_completion_date?: string | null;
          actual_completion_date?: string | null;
          contractor?: string | null;
          contractor_contact_id?: string | null;
          description?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          property_id?: string;
          deal_id?: string | null;
          name?: string;
          status?:
            | "planned"
            | "in_progress"
            | "completed"
            | "on_hold"
            | "cancelled";
          budget_amount?: number | null;
          spent_amount?: number | null;
          start_date?: string | null;
          target_completion_date?: string | null;
          actual_completion_date?: string | null;
          contractor?: string | null;
          contractor_contact_id?: string | null;
          description?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "capex_projects_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "capex_projects_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "capex_projects_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "capex_projects_contractor_contact_id_fkey";
            columns: ["contractor_contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "capex_projects_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      debt_instruments: {
        Row: {
          id: string;
          org_id: string;
          property_id: string | null;
          deal_id: string | null;
          lender_company_id: string | null;
          loan_name: string;
          loan_type:
            | "permanent"
            | "bridge"
            | "construction"
            | "mezzanine"
            | "line_of_credit"
            | "other";
          original_amount: number | null;
          current_balance: number | null;
          interest_rate: number | null;
          rate_type: "fixed" | "floating" | "hybrid";
          spread_over_index: number | null;
          index_name: string | null;
          origination_date: string | null;
          maturity_date: string | null;
          io_period_months: number | null;
          amortization_months: number | null;
          annual_debt_service: number | null;
          dscr: number | null;
          ltv_current: number | null;
          prepayment_terms: string | null;
          covenants: Json;
          recourse:
            | "full"
            | "partial"
            | "non_recourse"
            | null;
          guarantor: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          property_id?: string | null;
          deal_id?: string | null;
          lender_company_id?: string | null;
          loan_name: string;
          loan_type:
            | "permanent"
            | "bridge"
            | "construction"
            | "mezzanine"
            | "line_of_credit"
            | "other";
          original_amount?: number | null;
          current_balance?: number | null;
          interest_rate?: number | null;
          rate_type: "fixed" | "floating" | "hybrid";
          spread_over_index?: number | null;
          index_name?: string | null;
          origination_date?: string | null;
          maturity_date?: string | null;
          io_period_months?: number | null;
          amortization_months?: number | null;
          annual_debt_service?: number | null;
          dscr?: number | null;
          ltv_current?: number | null;
          prepayment_terms?: string | null;
          covenants?: Json;
          recourse?:
            | "full"
            | "partial"
            | "non_recourse"
            | null;
          guarantor?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          property_id?: string | null;
          deal_id?: string | null;
          lender_company_id?: string | null;
          loan_name?: string;
          loan_type?:
            | "permanent"
            | "bridge"
            | "construction"
            | "mezzanine"
            | "line_of_credit"
            | "other";
          original_amount?: number | null;
          current_balance?: number | null;
          interest_rate?: number | null;
          rate_type?: "fixed" | "floating" | "hybrid";
          spread_over_index?: number | null;
          index_name?: string | null;
          origination_date?: string | null;
          maturity_date?: string | null;
          io_period_months?: number | null;
          amortization_months?: number | null;
          annual_debt_service?: number | null;
          dscr?: number | null;
          ltv_current?: number | null;
          prepayment_terms?: string | null;
          covenants?: Json;
          recourse?:
            | "full"
            | "partial"
            | "non_recourse"
            | null;
          guarantor?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "debt_instruments_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "debt_instruments_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "debt_instruments_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "debt_instruments_lender_company_id_fkey";
            columns: ["lender_company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "debt_instruments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      investors: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          type: "individual" | "entity" | "fund" | "family_office" | "institution" | "other";
          contact_id: string | null;
          company_id: string | null;
          accredited: boolean;
          tax_id: string | null;
          entity_name: string | null;
          address_line1: string | null;
          address_city: string | null;
          address_state: string | null;
          address_zip: string | null;
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
          type?: "individual" | "entity" | "fund" | "family_office" | "institution" | "other";
          contact_id?: string | null;
          company_id?: string | null;
          accredited?: boolean;
          tax_id?: string | null;
          entity_name?: string | null;
          address_line1?: string | null;
          address_city?: string | null;
          address_state?: string | null;
          address_zip?: string | null;
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
          type?: "individual" | "entity" | "fund" | "family_office" | "institution" | "other";
          contact_id?: string | null;
          company_id?: string | null;
          accredited?: boolean;
          tax_id?: string | null;
          entity_name?: string | null;
          address_line1?: string | null;
          address_city?: string | null;
          address_state?: string | null;
          address_zip?: string | null;
          notes?: string | null;
          tags?: string[];
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "investors_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investors_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investors_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investors_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      investor_commitments: {
        Row: {
          id: string;
          org_id: string;
          investor_id: string;
          deal_id: string;
          committed_amount: number;
          called_amount: number;
          status: "committed" | "partially_called" | "fully_called" | "returned";
          commitment_date: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          investor_id: string;
          deal_id: string;
          committed_amount?: number;
          called_amount?: number;
          status?: "committed" | "partially_called" | "fully_called" | "returned";
          commitment_date?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          investor_id?: string;
          deal_id?: string;
          committed_amount?: number;
          called_amount?: number;
          status?: "committed" | "partially_called" | "fully_called" | "returned";
          commitment_date?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "investor_commitments_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investor_commitments_investor_id_fkey";
            columns: ["investor_id"];
            isOneToOne: false;
            referencedRelation: "investors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investor_commitments_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investor_commitments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      investor_distributions: {
        Row: {
          id: string;
          org_id: string;
          investor_id: string;
          deal_id: string;
          commitment_id: string | null;
          distribution_date: string;
          amount: number;
          type: "preferred_return" | "profit_share" | "return_of_capital" | "refinance_proceeds" | "sale_proceeds" | "other";
          period_label: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          investor_id: string;
          deal_id: string;
          commitment_id?: string | null;
          distribution_date: string;
          amount: number;
          type?: "preferred_return" | "profit_share" | "return_of_capital" | "refinance_proceeds" | "sale_proceeds" | "other";
          period_label?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          investor_id?: string;
          deal_id?: string;
          commitment_id?: string | null;
          distribution_date?: string;
          amount?: number;
          type?: "preferred_return" | "profit_share" | "return_of_capital" | "refinance_proceeds" | "sale_proceeds" | "other";
          period_label?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "investor_distributions_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investor_distributions_investor_id_fkey";
            columns: ["investor_id"];
            isOneToOne: false;
            referencedRelation: "investors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investor_distributions_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investor_distributions_commitment_id_fkey";
            columns: ["commitment_id"];
            isOneToOne: false;
            referencedRelation: "investor_commitments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investor_distributions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      waterfall_tiers: {
        Row: {
          id: string;
          org_id: string;
          deal_id: string;
          tier_order: number;
          tier_label: string;
          hurdle_rate: number | null;
          lp_split_pct: number | null;
          gp_split_pct: number | null;
          is_catch_up: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          deal_id: string;
          tier_order: number;
          tier_label: string;
          hurdle_rate?: number | null;
          lp_split_pct?: number | null;
          gp_split_pct?: number | null;
          is_catch_up?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          deal_id?: string;
          tier_order?: number;
          tier_label?: string;
          hurdle_rate?: number | null;
          lp_split_pct?: number | null;
          gp_split_pct?: number | null;
          is_catch_up?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "waterfall_tiers_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "waterfall_tiers_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          type:
            | "task_assigned"
            | "deal_stage_changed"
            | "lease_expiring"
            | "document_uploaded"
            | "commitment_created"
            | "distribution_created";
          title: string;
          body: string | null;
          entity_type: string | null;
          entity_id: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          type:
            | "task_assigned"
            | "deal_stage_changed"
            | "lease_expiring"
            | "document_uploaded"
            | "commitment_created"
            | "distribution_created";
          title: string;
          body?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          type?:
            | "task_assigned"
            | "deal_stage_changed"
            | "lease_expiring"
            | "document_uploaded"
            | "commitment_created"
            | "distribution_created";
          title?: string;
          body?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      v_rent_roll: {
        Row: {
          property_id: string;
          tenant_id: string;
          tenant_name: string;
          unit_label: string | null;
          lease_id: string;
          lease_type: string;
          start_date: string;
          end_date: string | null;
          rent_amount: number | null;
          rent_frequency: string;
          occupied_sf: number | null;
          tenant_status: string;
        };
        Relationships: [];
      };
    };
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
      get_expiring_leases: {
        Args: {
          org_id_input: string;
          within_days?: number;
        };
        Returns: {
          lease_id: string;
          tenant_id: string;
          tenant_name: string;
          property_id: string;
          property_name: string;
          lease_type: string;
          end_date: string;
          rent_amount: number | null;
          days_until_expiry: number;
        }[];
      };
      portfolio_aum: {
        Args: Record<string, never>;
        Returns: number;
      };
      portfolio_noi: {
        Args: { p_year: number };
        Returns: number;
      };
      portfolio_occupancy: {
        Args: Record<string, never>;
        Returns: number;
      };
      portfolio_weighted_cap_rate: {
        Args: Record<string, never>;
        Returns: number;
      };
      pipeline_by_stage: {
        Args: Record<string, never>;
        Returns: {
          stage: string;
          deal_count: number;
          total_value: number;
        }[];
      };
      debt_maturity_ladder: {
        Args: Record<string, never>;
        Returns: {
          maturity_year: number;
          loan_count: number;
          total_balance: number;
        }[];
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
};
