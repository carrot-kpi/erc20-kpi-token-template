export const getCampaignLink = (id: string) => {
    if (ENVIRONMENT === "dev" || ENVIRONMENT === "staging")
        return `https://app.${ENVIRONMENT}.carrot.community/#/campaigns/${id}`;
    return `https://carrot.eth/#/campaigns/${id}`;
};
