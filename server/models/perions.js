function PerionStatReportsModel(orango) {
    let PerionStatReportsSchema = new orango.Schema({
        company_id: { type: String },  
        date: { type: Date, default: Date.now },
        country_code: {type: String},
        country_name: {type: String},
        provider: {type: String},
        subid: { type: Number }, 
        product: {type: String }, 
        wallet: {type: String},
        revenue: { type: Number },
        monetized_searches: { type: Number },
        total_impressions: { type: Number },
        ad_clicks: { type: Number },
        cf_initial_searches: { type: Number },
        bing_initial_searches: { type: Number },
        ad_impressions: { type: Number },
        bing_follow_on_searches: { type: Number },
        cpc: { type: Number },
        ctr: { type: Number },
        coverage_cf: { type: Number },
        coverage_bing: { type: Number },
        follow_on_searches_percentage: { type: Number },
        initial_searches_diff: { type: Number },
        initial_searches_rpm: { type: Number },
        split: { type: Number },  
        
    })
    orango.model('PerionStatReports', PerionStatReportsSchema)
}
module.exports = {
    PerionStatReportsModel
}