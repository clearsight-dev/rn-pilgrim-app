export interface IClickpostGetRewardPointResponse {
  status: string;
  data: {
    lifetime_points: number;
    lifetime_points_formatted: string;
    available_points: number;
    available_points_formatted: string;
    point_earning_ratio: number;
    tier: any[];
    discount_code: Array<{
      discount_code: string;
      discount_type: string;
      discount_value: string;
      product_id: string;
      reward_description: string;
      customer_id: string;
      date_created: string;
    }>;
  };
}

export interface IClickpostGetUnusedDiscountResponse {
  status: string;
  data: Array<{
    discount_code: string;
    discount_type: string;
    discount_value: string;
    product_id: string;
    reward_description: string;
    customer_id: string;
    date_created: string;
  }>;
}

// Need to write an interface for the Get Earn Point Tab API
// This is how the response looks like:

export interface IClickpostGetEarnPointTabResponse {
  status: string;
  data: {
    loyalty_popup_colors: {
      sidebar_background_color: string;
      sidebar_text_color: string;
      button_background_color: string;
      button_text_color: string;
    };
    loyalty_sidebar_tabs: {
      get_earn_points: string;
      get_rewards: string;
      get_reward_history: string;
      get_vip_program: string;
      get_refer_friend: string;
      get_redeem_rewards: string;
      get_help: string;
    };
    get_earn_points: Array<{
      rule_id: string;
      activity_name: string;
      activity_description: string;
      activity_button_text: string;
      redirection_url: string;
      is_social_activity: Number;
    }>;
  };
}