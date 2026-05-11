// Central translation dictionary for TH/EN bilingual support
// Usage: import { useLanguage } from '@/lib/useLanguage'; const { t } = useLanguage();

export type Language = 'th' | 'en';

export const translations = {
  // ---- SIDEBAR ----
  nav_overview: { en: 'Overview', th: 'ภาพรวม' },
  nav_prompt_magic: { en: 'Prompt Magic', th: 'Prompt Magic' },
  nav_image_studio: { en: 'Image Studio', th: 'Image Studio' },
  nav_video_creator: { en: 'Video Creator', th: 'Video Creator' },
  nav_campaign_builder: { en: 'Campaign Builder', th: 'Campaign Builder' },
  nav_gallery: { en: 'Gallery', th: 'แกลเลอรี' },
  nav_wallet: { en: 'Wallet & Coins', th: 'กระเป๋า & เหรียญ' },
  nav_profile: { en: 'My Profile', th: 'โปรไฟล์ของฉัน' },

  // ---- HEADER ----
  header_top_up: { en: 'Top up', th: 'เติมเหรียญ' },

  // ---- OVERVIEW DASHBOARD ----
  overview_title: { en: 'Overview Dashboard', th: 'ภาพรวม' },
  overview_subtitle: { en: "Let's build something amazing today.", th: 'มาสร้างสิ่งยอดเยี่ยมกันวันนี้เลย' },
  overview_welcome: { en: 'Welcome back,', th: 'ยินดีต้อนรับกลับมา,' },
  overview_daily_reward: { en: 'Daily Reward', th: 'รางวัลประจำวัน' },
  overview_total_assets: { en: 'Total Assets', th: 'ทั้งหมด' },
  overview_images: { en: 'Images', th: 'รูปภาพ' },
  overview_videos: { en: 'Videos', th: 'วิดีโอ' },
  overview_balance: { en: 'Balance', th: 'ยอดเหรียญ' },
  overview_all_time: { en: 'all time', th: 'ตลอดกาล' },
  overview_generated: { en: 'generated', th: 'สร้างแล้ว' },
  overview_coins_available: { en: 'coins available', th: 'เหรียญคงเหลือ' },
  overview_top_up: { en: 'Top up', th: 'เติมเหรียญ' },
  overview_analytics: { en: 'Usage Analytics', th: 'สถิติการใช้งาน' },
  overview_analytics_sub: { en: 'Generations per day of the week', th: 'จำนวนการสร้างต่อวัน' },
  overview_quick_start: { en: 'Quick Start', th: 'เริ่มต้นเร็ว' },
  overview_community: { en: 'Community Trending', th: 'ยอดนิยมในชุมชน' },
  overview_community_sub: { en: 'Explore and support fellow creators', th: 'สำรวจและสนับสนุนนักสร้างด้วยกัน' },
  overview_recent: { en: 'Recent Activity', th: 'กิจกรรมล่าสุด' },
  overview_recent_sub: { en: 'Your latest 5 generations', th: '5 รายการล่าสุดของคุณ' },
  overview_view_all: { en: 'View All', th: 'ดูทั้งหมด' },
  overview_no_activity: { en: 'No recent activity found.', th: 'ยังไม่มีกิจกรรมล่าสุด' },
  overview_no_community: { en: 'No community trends on this page.', th: 'ไม่มีเทรนด์ในหน้านี้' },
  overview_by: { en: 'By', th: 'โดย' },

  // ---- IMAGE STUDIO ----
  image_title: { en: 'Image Studio', th: 'Image Studio' },
  image_sub: { en: 'Generate commercial product images with AI.', th: 'สร้างรูปภาพสินค้าเชิงพาณิชย์ด้วย AI' },
  image_desc: { en: 'Turn ideas into premium commercial images. Adjust camera angles, lighting, and style as if you have a virtual studio on your screen.', th: 'เปลี่ยนคำสั่งให้เป็นภาพสินค้าสุดพรีเมียม ปรับแต่งมุมกล้อง ทิศทางแสง และสไตล์ภาพได้ดั่งใจ เหมือนย้ายสตูดิโอมาไว้บนหน้าจอ' },
  image_example: { en: '(Best for: Product photography, Before/After showcases, or Catalogs)', th: '(เหมาะสำหรับ: ทำภาพโปรโมทสินค้า, ภาพ Before/After หรือแคตตาล็อก)' },
  image_prompt_label: { en: 'Describe your image', th: 'อธิบายภาพที่ต้องการ' },
  image_generate_btn: { en: 'Generate Image', th: 'สร้างภาพ' },
  image_generating: { en: 'Generating...', th: 'กำลังสร้าง...' },
  image_let_ai_think: { en: "Let AI Think", th: "ให้ AI คิดให้" },
  image_download: { en: 'Download', th: 'ดาวน์โหลด' },
  image_regenerate: { en: 'Regenerate', th: 'สร้างใหม่' },
  image_upload_ref: { en: 'Upload Reference', th: 'อัปโหลดรูปอ้างอิง' },
  image_category: { en: 'Category', th: 'หมวดหมู่' },
  image_aspect_ratio: { en: 'Aspect Ratio', th: 'สัดส่วนภาพ' },
  image_quality: { en: 'Render Quality', th: 'คุณภาพการเรนเดอร์' },
  image_generation_mode: { en: 'Generation Mode', th: 'โหมดการสร้าง' },
  image_advanced: { en: 'Advanced Settings', th: 'ตั้งค่าขั้นสูง' },
  image_style: { en: 'Style', th: 'สไตล์' },
  image_camera: { en: 'Camera Angle', th: 'มุมกล้อง' },
  image_lighting: { en: 'Lighting', th: 'แสง' },
  image_presenter: { en: 'Presenter', th: 'ผู้นำเสนอ' },
  image_result_title: { en: 'Generated Result', th: 'ผลลัพธ์' },
  image_result_placeholder: { en: 'Your generated image will appear here.', th: 'ภาพที่สร้างจะแสดงที่นี่' },

  // ---- VIDEO CREATOR ----
  video_title: { en: 'Video Creator', th: 'Video Creator' },
  video_sub: { en: 'Generate commercial video ads with AI.', th: 'สร้างวิดีโอโฆษณาด้วย AI' },
  video_desc: { en: 'Upload your product image and let AI animate it realistically. Capture attention and keep your audience engaged until the very end.', th: 'อัปโหลดภาพสินค้าของคุณ แล้วสั่งให้ AI ทำให้ภาพเคลื่อนไหวได้สมจริง ดึงดูดสายตาลูกค้าให้หยุดนิ้วดูจนจบ' },
  video_example: { en: '(Best for: Short clips for TikTok, Reels, or standout social ads)', th: '(เหมาะสำหรับ: ทำคลิปสั้นลง TikTok, Reels หรือโฆษณาที่ต้องการความโดดเด่น)' },
  video_prompt_label: { en: 'Describe your video scene', th: 'อธิบายฉากวิดีโอ' },
  video_generate_btn: { en: 'Generate Video Ad', th: 'สร้างวิดีโอโฆษณา' },
  video_duration: { en: 'Duration', th: 'ความยาว' },
  video_download: { en: 'Download Video', th: 'ดาวน์โหลดวิดีโอ' },
  video_regenerate: { en: 'Regenerate', th: 'สร้างใหม่' },

  // ---- CAMPAIGN BUILDER ----
  campaign_title: { en: 'Campaign Builder', th: 'Campaign Builder' },
  campaign_sub: { en: 'Turn your images into high-converting social media posts in 1-click.', th: 'เปลี่ยนรูปภาพเป็นโพสต์โซเชียลที่ขายดีด้วยคลิกเดียว' },
  campaign_desc: { en: 'Combine your generated images with compelling copy, structured for conversion, ready to be published instantly.', th: 'นำภาพสินค้ามาจัดวางในรูปแบบแคมเปญ พร้อมแคปชันและเลย์เอาต์ที่ออกแบบมาเพื่อกระตุ้นยอดขาย นำไปโพสต์ใช้งานได้ทันที' },
  campaign_example: { en: '(Best for: Facebook Ads, Instagram posts, or direct sales campaigns)', th: '(เหมาะสำหรับ: โฆษณา Facebook, โพสต์ Instagram หรือแคมเปญขายตรง)' },
  campaign_settings: { en: 'Campaign Settings', th: 'ตั้งค่าแคมเปญ' },
  campaign_select_image: { en: 'Select Image from Gallery', th: 'เลือกรูปจากแกลเลอรี' },
  campaign_platform: { en: 'Platform', th: 'แพลตฟอร์ม' },
  campaign_language: { en: 'Language', th: 'ภาษา' },
  campaign_tone: { en: 'Tone of Voice', th: 'โทนเสียง' },
  campaign_objective: { en: 'Campaign Objective', th: 'วัตถุประสงค์แคมเปญ' },
  campaign_audience: { en: 'Target Audience', th: 'กลุ่มเป้าหมาย' },
  campaign_promotion: { en: 'Key Offer / Promotion', th: 'โปรโมชัน / ข้อเสนอพิเศษ' },
  campaign_product_name: { en: 'Product Name (Optional)', th: 'ชื่อสินค้า (ไม่บังคับ)' },
  campaign_additional: { en: 'Additional Details (Optional)', th: 'รายละเอียดเพิ่มเติม (ไม่บังคับ)' },
  campaign_build_btn: { en: 'Build Campaign', th: 'สร้างแคมเปญ' },
  campaign_generating: { en: 'Generating Agency Copy...', th: 'กำลังเขียน Copy...' },
  campaign_ready: { en: 'Ready to Post', th: 'พร้อมโพสต์' },
  campaign_copy_caption: { en: 'Copy Caption', th: 'คัดลอกแคปชั่น' },
  campaign_live_preview: { en: 'Live Preview', th: 'ตัวอย่างสด' },
  campaign_editable: { en: 'Generated Copy (Editable)', th: 'ข้อความที่สร้าง (แก้ไขได้)' },
  campaign_my_campaigns: { en: 'My Campaigns', th: 'แคมเปญของฉัน' },
  campaign_create: { en: 'Create', th: 'สร้าง' },
  campaign_no_campaigns: { en: "No campaigns yet. Let's create one!", th: 'ยังไม่มีแคมเปญ มาสร้างกันเลย!' },

  // ---- PROMPT ENHANCER ----
  prompt_title: { en: 'Prompt Magic', th: 'Prompt Magic' },
  prompt_sub: { en: 'Transform simple ideas into professional AI prompts.', th: 'เปลี่ยนไอเดียง่ายๆ ให้เป็น Prompt ระดับมืออาชีพ' },
  prompt_magic_desc: { en: 'Type a short idea and let AI generate a professional prompt for the best image results.', th: 'พิมพ์ไอเดียสั้นๆ ภาษาไทย แล้วปล่อยให้ AI แต่งประโยคคำสั่งระดับมืออาชีพให้คุณ เพื่อผลลัพธ์ภาพที่สวยเป๊ะที่สุด' },
  prompt_magic_example: { en: '(Example: Type "soap on a rock" and AI will expand it into a stunning studio scene)', th: '(ตัวอย่าง: พิมพ์แค่ "สบู่บนหิน" AI จะขยายเป็นฉากสตูดิโอสุดอลังการให้)' },
  prompt_input_label: { en: 'Your simple idea', th: 'ไอเดียของคุณ' },
  prompt_enhance_btn: { en: 'Enhance Prompt', th: 'ปรับปรุง Prompt' },
  prompt_copy: { en: 'Copy', th: 'คัดลอก' },
  prompt_result_placeholder: { en: 'Your enhanced prompt will appear here.', th: 'Prompt ที่ปรับปรุงแล้วจะแสดงที่นี่' },
  prompt_tone: { en: 'Tone', th: 'โทน' },
  prompt_length: { en: 'Length', th: 'ความยาว' },
  prompt_language: { en: 'Output Language', th: 'ภาษาที่ต้องการ' },

  // ---- PROFILE ----
  profile_title: { en: 'My Profile', th: 'โปรไฟล์ของฉัน' },
  profile_member: { en: 'Member', th: 'สมาชิก' },
  profile_balance: { en: 'Balance', th: 'ยอดเหรียญ' },
  profile_total_topup: { en: 'Total Top Up', th: 'เติมเหรียญทั้งหมด' },
  profile_coins_earned: { en: 'coins earned', th: 'เหรียญที่ได้รับ' },
  profile_total_spent: { en: 'Total Spent', th: 'ใช้ไปทั้งหมด' },
  profile_coins_used: { en: 'coins used', th: 'เหรียญที่ใช้' },
  profile_generations: { en: 'Generations', th: 'จำนวนที่สร้าง' },
  profile_total_created: { en: 'total created', th: 'สร้างทั้งหมด' },
  profile_tx_history: { en: 'Transaction History', th: 'ประวัติธุรกรรม' },
  profile_records: { en: 'records', th: 'รายการ' },
  profile_no_tx: { en: 'No transaction history found.', th: 'ยังไม่มีประวัติธุรกรรม' },
  profile_available: { en: 'Available', th: 'คงเหลือ' },
  profile_top_up: { en: 'Top Up Now', th: 'เติมเหรียญเลย' },
  profile_account: { en: 'Account', th: 'บัญชี' },
  profile_status: { en: 'Status', th: 'สถานะ' },
  profile_active: { en: 'Active & Verified', th: 'ใช้งานและยืนยันแล้ว' },
  profile_unlocked: { en: 'All features unlocked', th: 'ปลดล็อกทุกฟีเจอร์แล้ว' },
  profile_sign_out: { en: 'Sign Out', th: 'ออกจากระบบ' },

  // ---- WALLET / PRICING ----
  wallet_title: { en: 'Wallet & Coins', th: 'กระเป๋า & เหรียญ' },
  wallet_sub: { en: 'Top up coins to generate images, videos, and campaigns.', th: 'เติมเหรียญเพื่อสร้างรูปภาพ วิดีโอ และแคมเปญ' },
  wallet_tx_history: { en: 'Transaction History', th: 'ประวัติธุรกรรม' },
  wallet_available: { en: 'coins available', th: 'เหรียญคงเหลือ' },
  wallet_top_up_now: { en: 'Top Up Now', th: 'เติมเหรียญเลย' },
  wallet_packages: { en: 'Choose a Package', th: 'เลือกแพ็กเกจ' },
  wallet_packages_sub: { en: '1 THB = 10 Coins. Bigger packages include bonus coins.', th: '1 บาท = 10 เหรียญ แพ็กเกจใหญ่กว่าได้โบนัสเพิ่ม' },
  wallet_pay_btn: { en: 'Pay', th: 'ชำระเงิน' },
  wallet_get: { en: 'to get', th: 'เพื่อรับ' },
  wallet_coins: { en: 'Coins', th: 'เหรียญ' },
  wallet_bonus: { en: 'Bonus', th: 'โบนัส' },
  wallet_no_tx: { en: 'No transactions yet', th: 'ยังไม่มีธุรกรรม' },
  wallet_no_tx_sub: { en: 'Your history will appear here.', th: 'ประวัติของคุณจะแสดงที่นี่' },
  wallet_min_amount: { en: 'Minimum amount is', th: 'จำนวนขั้นต่ำคือ' },

  // ---- GENERAL ----
  show_info: { en: 'How to use', th: 'ดูวิธีใช้งาน' },
  hide_info: { en: 'Hide info', th: 'ซ่อนวิธีใช้งาน' },
  general_copy: { en: 'Copy', th: 'คัดลอก' },
  general_copied: { en: 'Copied!', th: 'คัดลอกแล้ว!' },
  general_download: { en: 'Download', th: 'ดาวน์โหลด' },
  general_loading: { en: 'Loading...', th: 'กำลังโหลด...' },
  general_error: { en: 'An error occurred.', th: 'เกิดข้อผิดพลาด' },
  general_suspended: { en: 'Account Suspended', th: 'บัญชีถูกระงับ' },
  general_not_enough_coins: { en: 'Not enough coins!', th: 'เหรียญไม่เพียงพอ!' },

  // ---- CATEGORIES (shared) ----
  cat_none: { en: 'None', th: 'ไม่ระบุ' },
  cat_product_photo: { en: 'Product Photography', th: 'ถ่ายภาพสินค้า' },
  cat_tshirt: { en: 'T-Shirt Design', th: 'ออกแบบเสื้อยืด' },
  cat_sticker: { en: 'Sticker & Die-cut', th: 'สติ๊กเกอร์' },
  cat_packaging: { en: 'Packaging Design', th: 'บรรจุภัณฑ์' },
  cat_pattern: { en: 'Seamless Pattern', th: 'ลายซ้ำ' },
  cat_logo: { en: 'Logo Concept', th: 'คอนเซ็ปต์โลโก้' },
  cat_3d: { en: '3D Icon', th: '3D Icon' },
  cat_mockup: { en: 'Product Mockup', th: 'Mockup สินค้า' },

  // ---- PROMPT TONE ----
  tone_creative: { en: 'Creative & Professional', th: 'สร้างสรรค์ & มืออาชีพ' },
  tone_direct: { en: 'Direct & Minimalist', th: 'ตรงไปตรงมา & มินิมอล' },
  tone_dramatic: { en: 'Dramatic & Cinematic', th: 'ดรามา & ซีนีมาติก' },
  tone_cute: { en: 'Cute & Friendly', th: 'น่ารัก & เป็นมิตร' },
  tone_luxury: { en: 'Luxury & Elegant', th: 'หรูหรา & สง่างาม' },
  tone_tech: { en: 'Tech & Futuristic', th: 'เทคโนโลยี & ล้ำสมัย' },

  // ---- PROMPT LENGTH ----
  len_short: { en: 'Short (around 20-30 words)', th: 'สั้น (~20-30 คำ)' },
  len_medium: { en: 'Medium (around 50-80 words)', th: 'กลาง (~50-80 คำ)' },
  len_long: { en: 'Long (around 100-150 words)', th: 'ยาว (~100-150 คำ)' },

  // ---- STYLE ----
  style_cinematic: { en: 'Cinematic', th: 'ซีนีมาติก' },
  style_muji: { en: 'Muji Style', th: 'สไตล์ Muji' },
  style_cyberpunk: { en: 'Cyberpunk', th: 'ไซเบอร์พังก์' },
  style_anime: { en: 'Anime', th: 'อนิเมะ' },
  style_vintage: { en: 'Vintage', th: 'วินเทจ' },
  style_3d_anim: { en: '3D Animation', th: '3D Animation' },
  style_realistic: { en: 'Realistic', th: 'เหมือนจริง' },
  style_fantasy: { en: 'Fantasy', th: 'แฟนตาซี' },

  // ---- CAMERA ----
  cam_drone: { en: 'Drone View', th: 'มุมโดรน' },
  cam_closeup: { en: 'Close-up', th: 'ระยะใกล้' },
  cam_wide: { en: 'Wide Angle', th: 'มุมกว้าง' },
  cam_macro: { en: 'Macro', th: 'มาโคร' },
  cam_tracking: { en: 'Tracking Shot', th: 'ติดตามวัตถุ' },
  cam_pan: { en: 'Pan', th: 'แพน' },
  cam_fpv: { en: 'First-Person View (FPV)', th: 'มุมมองบุคคลที่หนึ่ง' },

  // ---- LIGHTING ----
  light_cinematic: { en: 'Cinematic Lighting', th: 'แสงซีนีมาติก' },
  light_natural: { en: 'Natural Light', th: 'แสงธรรมชาติ' },
  light_neon: { en: 'Neon', th: 'นีออน' },
  light_golden: { en: 'Golden Hour', th: 'แสงทอง' },
  light_studio: { en: 'Studio Lighting', th: 'แสงสตูดิโอ' },
  light_dark: { en: 'Dark & Moody', th: 'มืด & ลึกลับ' },

  // ---- PRESENTER ----
  pres_thai_f: { en: 'Thai Female Model', th: 'นางแบบหญิงไทย' },
  pres_korean_f: { en: 'Korean Female Idol', th: 'ไอดอลเกาหลีหญิง' },
  pres_western_m: { en: 'Caucasian Male Model', th: 'นายแบบตะวันตก' },
  pres_hand: { en: 'Minimalist Hand Model', th: 'มือมินิมอล' },
  pres_group: { en: 'Lifestyle Group', th: 'กลุ่มไลฟ์สไตล์' },

  // ---- CAMPAIGN TONES ----
  camp_tone_engaging: { en: 'Engaging & Professional', th: 'น่าสนใจ & มืออาชีพ' },
  camp_tone_fun: { en: 'Fun & Casual', th: 'สนุก & ไม่เป็นทางการ' },
  camp_tone_hard_sell: { en: 'Hard Sell (Urgent)', th: 'ขายตรง (เร่งด่วน)' },
  camp_tone_story: { en: 'Storytelling', th: 'เล่าเรื่อง' },

  // ---- CAMPAIGN OBJECTIVES ----
  obj_conversion: { en: 'Direct Conversion / Sales', th: 'เพิ่มยอดขายโดยตรง' },
  obj_engagement: { en: 'Engagement & Viral', th: 'Engagement & Viral' },
  obj_awareness: { en: 'Brand Awareness', th: 'สร้าง Brand Awareness' },
  obj_leads: { en: 'Lead Generation', th: 'สร้าง Leads' },

  // ---- VIDEO CATEGORIES ----
  vcat_product: { en: 'Product Showcase', th: 'โชว์สินค้า' },
  vcat_tiktok: { en: 'TikTok / Reels Ad', th: 'โฆษณา TikTok / Reels' },
  vcat_cinematic: { en: 'Cinematic Promo', th: 'โปรโมชั่นซีนีมาติก' },
  vcat_stop_motion: { en: 'Stop Motion', th: 'Stop Motion' },
  vcat_3d_reveal: { en: '3D Product Reveal', th: '3D เปิดตัวสินค้า' },
  vcat_broll: { en: 'B-Roll Footage', th: 'B-Roll' },

  // ---- LANDING PAGE ----
  landing_signin: { en: 'Sign In', th: 'เข้าสู่ระบบ' },
  landing_commercial_tools: { en: 'Commercial AI Tools', th: 'เครื่องมือ AI เชิงพาณิชย์' },
  landing_hero_title_create: { en: 'CREATE ', th: 'สร้าง' },
  landing_hero_title_pro: { en: 'PROFESSIONAL', th: 'ผลงานระดับมืออาชีพ' },
  landing_hero_title_end: { en: ' AI VISUALS & VIDEOS IN SECONDS', th: 'ด้วย AI ในไม่กี่วินาที' },
  landing_hero_sub: { en: 'Unlock the power of advanced AI models to build high-quality commercial assets instantly. Join the future of content creation.', th: 'ปลดล็อกพลังของโมเดล AI ขั้นสูงเพื่อสร้างสรรค์ชิ้นงานโฆษณาคุณภาพสูงได้ทันที พลิกโฉมอนาคตของการทำคอนเทนต์' },
  landing_btn_start: { en: "START CREATING - IT'S FREE", th: 'เริ่มต้นสร้างผลงาน - ใช้ฟรี' },
  landing_btn_explore: { en: 'EXPLORE SHOWCASE', th: 'ดูผลงานในชุมชน' },

} as const;

export type TranslationKey = keyof typeof translations;