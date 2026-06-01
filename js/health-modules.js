/* =============================================
   PureScan — Health Intelligence Modules
   ADDITIVE ONLY — Does NOT modify existing code.
   Injects new UI components dynamically.
   ============================================= */

(function () {
  'use strict';

  // ==========================================
  // CONSTANTS & CONFIG
  // ==========================================
  const PS_CHAT_HISTORY_KEY = 'purescan_chat_history';
  const PS_DAILY_TIP_KEY = 'purescan_tip_index';
  const PS_BMI_KEY = 'purescan_bmi';

  // ==========================================
  // HEALTH MODULES i18n (all UI text)
  // ==========================================
  const MI = {
    en: {
      nav_home:'Home', nav_chat:'AI Chat', nav_weight:'Weight', nav_fitness:'Fitness', nav_nutrition:'Nutrition',
      chat_title:'AI Health Assistant', chat_clear:'Clear', chat_placeholder:'Ask about health or scan a barcode...',
      chat_w1:'👋 Hello! I\'m your <strong>AI Health Assistant</strong>.', chat_w2:'Ask me anything about:',
      chat_w3:'🔍 Product analysis & ingredients', chat_w4:'🥗 Diet advice & meal plans', chat_w5:'⚖️ Weight loss / weight gain tips', chat_w6:'💪 Fitness & workout nutrition', chat_w7:'💊 Vitamins & nutrition info', chat_w8:'Just type your question below!',
      weight_title:'Weight Management', wl_btn:'Weight Loss', wg_btn:'Weight Gain',
      fat_tips:'Fat Loss Tips', foods_avoid:'Foods to Avoid', muscle_tips:'Muscle Building Tips', hc_foods:'High Calorie Healthy Foods',
      bmi_title:'BMI Calculator', bmi_wt:'Weight (kg)', bmi_ht:'Height (cm)', bmi_calc:'Calculate BMI',
      bmi_uw:'Underweight', bmi_nw:'Normal', bmi_ow:'Overweight', bmi_ob:'Obese',
      bmi_uw_desc:'You are below the healthy weight range. Focus on nutrient-dense, calorie-rich foods.',
      bmi_nw_desc:'Great! You are in the healthy weight range. Maintain a balanced diet and regular exercise.',
      bmi_ow_desc:'You are above the healthy weight range. Consider a moderate calorie deficit and more physical activity.',
      bmi_ob_desc:'Your BMI indicates obesity. Please consult a healthcare professional for a personalized plan.',
      confirm_clear:'Clear all chat history?', alert_bmi_invalid:'Please enter valid weight and height.',
      alert_barcode_fail:'Could not detect barcode from image. Please try again.',
      fit_title:'Gym & Fitness Diet', daily_tip:'Daily Health Tip',
      pre_wo:'Pre-Workout Foods', pre_wo_sub:'Eat 30-60 minutes before training',
      post_wo:'Post-Workout Foods', post_wo_sub:'Eat within 30 minutes after training',
      gym_tips:'Beginner Gym Tips', weekly_diet:'Weekly Diet Plan',
      diet_day:'Day', diet_bf:'Breakfast', diet_lunch:'Lunch', diet_dinner:'Dinner',
      nut_title:'Nutrition Knowledge Hub', nut_desc:'Learn about essential vitamins, minerals, and nutrients your body needs. Tap any item to expand and learn about its functions, deficiency symptoms, and natural food sources.',
      vit_func:'Functions', vit_def:'Deficiency Symptoms', vit_src:'Best Natural Sources'
    },
    hi: {
      nav_home:'होम', nav_chat:'एआई चैट', nav_weight:'वजन', nav_fitness:'फिटनेस', nav_nutrition:'पोषण',
      chat_title:'एआई हेल्थ असिस्टेंट', chat_clear:'हटाएं', chat_placeholder:'स्वास्थ्य के बारे में पूछें या बार्कोड स्कैन करें...',
      chat_w1:'👋 नमस्ते! मैं आपका <strong>एआई हेल्थ असिस्टेंट</strong> हूं।', chat_w2:'मुझसे कुछ भी पूछें:',
      chat_w3:'🔍 उत्पाद विश्लेषण और सामग्री', chat_w4:'🥗 डाइट सलाह और भोजन योजना', chat_w5:'⚖️ वजन घटाने / बढ़ाने के टिप्स', chat_w6:'💪 फिटनेस और वर्कआउट पोषण', chat_w7:'💊 विटामिन और पोषण जानकारी', chat_w8:'बस नीचे अपना सवाल टाइप करें!',
      weight_title:'वजन प्रबंधन', wl_btn:'वजन घटाएं', wg_btn:'वजन बढ़ाएं',
      fat_tips:'फैट लॉस टिप्स', foods_avoid:'परहेज करें', muscle_tips:'मसल बिल्डिंग टिप्स', hc_foods:'हाई कैलोरी स्वस्थ खाद्य',
      bmi_title:'बीएमआई कैलकुलेटर', bmi_wt:'वजन (किग्रा)', bmi_ht:'ऊंचाई (सेमी)', bmi_calc:'बीएमआई गणना करें',
      bmi_uw:'कम वजन', bmi_nw:'सामान्य', bmi_ow:'अधिक वजन', bmi_ob:'मोटापा',
      bmi_uw_desc:'आप स्वस्थ वजन सीमा से नीचे हैं। पोषक तत्वों से भरपूर खाद्य पदार्थों पर ध्यान दें।',
      bmi_nw_desc:'बढ़िया! आप स्वस्थ वजन सीमा में हैं। संतुलित आहार और नियमित व्यायाम बनाए रखें।',
      bmi_ow_desc:'आप स्वस्थ वजन सीमा से ऊपर हैं। कैलोरी कम करें और शारीरिक गतिविधि बढ़ाएं।',
      bmi_ob_desc:'आपका BMI मोटापे को दर्शाता है। कृपया स्वास्थ्य विशेषज्ञ से सलाह लें।',
      confirm_clear:'क्या आप चैट इतिहास हटाना चाहते हैं?', alert_bmi_invalid:'कृपया सही वजन और ऊंचाई दर्ज करें।',
      alert_barcode_fail:'बार्कोड पहचानने में विफल। कृपया पुनः प्रयास करें।',
      fit_title:'जिम और फिटनेस डाइट', daily_tip:'दैनिक स्वास्थ्य टिप',
      pre_wo:'वर्कआउट से पहले', pre_wo_sub:'ट्रेनिंग से 30-60 मिनट पहले खाएं',
      post_wo:'वर्कआउट के बाद', post_wo_sub:'ट्रेनिंग के 30 मिनट के भीतर खाएं',
      gym_tips:'शुरुआत जिम टिप्स', weekly_diet:'साप्ताहिक डाइट प्लान',
      diet_day:'दिन', diet_bf:'नाश्ता', diet_lunch:'दोपहर', diet_dinner:'रात्रि',
      nut_title:'पोषण ज्ञान केंद्र', nut_desc:'आवश्यक विटामिन, खनिज और पोषक तत्वों के बारे में जानें। विस्तार के लिए किसी भी आइटम पर टैप करें।',
      vit_func:'कार्य', vit_def:'कमी के लक्षण', vit_src:'सर्वोत्तम प्राकृतिक स्रोत'
    },
    hinglish: {
      nav_home:'Home', nav_chat:'AI Chat', nav_weight:'Weight', nav_fitness:'Fitness', nav_nutrition:'Nutrition',
      chat_title:'AI Health Assistant', chat_clear:'Clear', chat_placeholder:'Health ke baare mein pucho ya barcode scan karo...',
      chat_w1:'👋 Hello! Main aapka <strong>AI Health Assistant</strong> hoon.', chat_w2:'Mujhse kuch bhi pucho:',
      chat_w3:'🔍 Product analysis aur ingredients', chat_w4:'🥗 Diet advice aur meal plans', chat_w5:'⚖️ Weight loss / gain tips', chat_w6:'💪 Fitness aur workout nutrition', chat_w7:'💊 Vitamins aur nutrition info', chat_w8:'Bas neeche apna sawaal type karo!',
      weight_title:'Weight Management', wl_btn:'Weight Loss', wg_btn:'Weight Gain',
      fat_tips:'Fat Loss Tips', foods_avoid:'In Se Bacho', muscle_tips:'Muscle Building Tips', hc_foods:'High Calorie Healthy Foods',
      bmi_title:'BMI Calculator', bmi_wt:'Weight (kg)', bmi_ht:'Height (cm)', bmi_calc:'BMI Calculate Karo',
      bmi_uw:'Underweight', bmi_nw:'Normal', bmi_ow:'Overweight', bmi_ob:'Obese',
      bmi_uw_desc:'Aapka weight healthy range se kam hai. Nutrient-dense foods pe focus karo.',
      bmi_nw_desc:'Badhiya! Aap healthy weight range mein ho. Balanced diet aur exercise maintain karo.',
      bmi_ow_desc:'Aapka weight healthy range se zyada hai. Calorie deficit aur exercise badhao.',
      bmi_ob_desc:'Aapka BMI obesity indicate karta hai. Doctor se consult karo.',
      confirm_clear:'Kya aap poora chat history delete karna chahte ho?', alert_bmi_invalid:'Sahi weight aur height daalo.',
      alert_barcode_fail:'Barcode detect nahi ho paya. Phir se try karo.',
      fit_title:'Gym Aur Fitness Diet', daily_tip:'Daily Health Tip',
      pre_wo:'Pre-Workout Foods', pre_wo_sub:'Training se 30-60 min pehle khao',
      post_wo:'Post-Workout Foods', post_wo_sub:'Training ke 30 min ke andar khao',
      gym_tips:'Beginner Gym Tips', weekly_diet:'Weekly Diet Plan',
      diet_day:'Din', diet_bf:'Nashta', diet_lunch:'Lunch', diet_dinner:'Dinner',
      nut_title:'Nutrition Knowledge Hub', nut_desc:'Zaroori vitamins, minerals aur nutrients ke baare mein jaano. Kisi bhi item pe tap karo details ke liye.',
      vit_func:'Functions', vit_def:'Kami Ke Lakshan', vit_src:'Sabse Acche Natural Sources'
    },
    mr: {
      nav_home:'होम', nav_chat:'एआय चॅट', nav_weight:'वजन', nav_fitness:'फिटनेस', nav_nutrition:'पोषण',
      chat_title:'एआय हेल्थ असिस्टंट', chat_clear:'हटवा', chat_placeholder:'आरोग्याबद्दल विचारा किंवा बार्कोड स्कॅन करा...',
      chat_w1:'👋 नमस्कार! मी तुमचा <strong>एआय हेल्थ असिस्टंट</strong> आहे.', chat_w2:'मला काहीही विचारा:',
      chat_w3:'🔍 उत्पादन विश्लेषण', chat_w4:'🥗 आहार सल्ला', chat_w5:'⚖️ वजन व्यवस्थापन', chat_w6:'💪 फिटनेस पोषण', chat_w7:'💊 व्हिटॅमिन माहिती', chat_w8:'खाली तुमचा प्रश्न टाइप करा!',
      weight_title:'वजन व्यवस्थापन', wl_btn:'वजन कमी', wg_btn:'वजन वाढ',
      fat_tips:'फॅट लॉस टिप्स', foods_avoid:'टाळायचे पदार्थ', muscle_tips:'स्नायू बांधणी टिप्स', hc_foods:'उच्च कॅलरी आरोग्यदायी अन्न',
      bmi_title:'बीएमआय कॅल्क्युलेटर', bmi_wt:'वजन (किग्रा)', bmi_ht:'उंची (सेमी)', bmi_calc:'बीएमआय गणना करा',
      bmi_uw:'कमी वजन', bmi_nw:'सामान्य', bmi_ow:'अधिक वजन', bmi_ob:'लठ्ठपणा',
      bmi_uw_desc:'तुम्ही निरोगी वजन मर्यादेखाली आहात. पोषक अन्नावर लक्ष द्या.',
      bmi_nw_desc:'छान! तुम्ही निरोगी वजन मर्यादेत आहात. संतुलित आहार आणि व्यायाम कायम ठेवा.',
      bmi_ow_desc:'तुम्ही निरोगी वजन मर्यादेवर आहात. कॅलरी कमी करा आणि व्यायाम वाढवा.',
      bmi_ob_desc:'तुमचा BMI लठ्ठपणा दर्शवतो. कृपया आरोग्य तज्ञांचा सल्ला घ्या.',
      confirm_clear:'सर्व चॅट इतिहास हटवायचा?', alert_bmi_invalid:'कृपया योग्य वजन आणि उंची टाका.',
      alert_barcode_fail:'बार्कोड ओळखता आला नाही. पुन्हा प्रयत्न करा.',
      fit_title:'जिम आणि फिटनेस आहार', daily_tip:'दैनिक आरोग्य टिप',
      pre_wo:'व्यायामापूर्वी अन्न', pre_wo_sub:'प्रशिक्षणापूर्वी 30-60 मिनिटे खा',
      post_wo:'व्यायामानंतर अन्न', post_wo_sub:'प्रशिक्षणानंतर 30 मिनिटांत खा',
      gym_tips:'नवशिक्या जिम टिप्स', weekly_diet:'साप्ताहिक आहार योजना',
      diet_day:'दिवस', diet_bf:'नाश्ता', diet_lunch:'दुपार', diet_dinner:'रात्री',
      nut_title:'पोषण ज्ञान केंद्र', nut_desc:'आवश्यक व्हिटॅमिन, खनिजे आणि पोषक तत्वांबद्दल जाणून घ्या.',
      vit_func:'कार्ये', vit_def:'कमतरतेची लक्षणे', vit_src:'सर्वोत्तम नैसर्गिक स्रोत'
    },
    gu: {
      nav_home:'હોમ', nav_chat:'એઆઈ ચેટ', nav_weight:'વજન', nav_fitness:'ફિટનેસ', nav_nutrition:'પોષણ',
      chat_title:'એઆઈ હેલ્થ આસિસ્ટન્ટ', chat_clear:'ક્લીયર', chat_placeholder:'સ્વાસ્થ્ય વિશે પૂછો...',
      chat_w1:'👋 નમસ્તે! હું તમારો <strong>એઆઈ હેલ્થ આસિસ્ટન્ટ</strong> છું.', chat_w2:'મને કંઈ પણ પૂછો:',
      chat_w3:'🔍 ઉત્પાદન વિશ્લેષણ', chat_w4:'🥗 ડાયેટ સલાહ', chat_w5:'⚖️ વજન વ્ટિપ્સ', chat_w6:'💪 ફિટનેસ પોષણ', chat_w7:'💊 વિટામિન માહિતી', chat_w8:'નીચે તમારો પ્રશ્ન ટાઈપ કરો!',
      weight_title:'વજન વ્યવસ્થાપન', wl_btn:'વજન ઘટાડો', wg_btn:'વજન વધારો',
      fat_tips:'ફેટ લોસ ટિપ્સ', foods_avoid:'ટાળવાના ખોરાક', muscle_tips:'સ્નાયુ નિર્માણ ટિપ્સ', hc_foods:'ઉચ્ચ કેલરી ખોરાક',
      bmi_title:'BMI કેલ્ક્યુલેટર', bmi_wt:'વજન (kg)', bmi_ht:'ઊંચાઈ (cm)', bmi_calc:'BMI ગણો',
      bmi_uw:'ઓછું વજન', bmi_nw:'સામાન્ય', bmi_ow:'વધુ વજન', bmi_ob:'સ્થૂળતા',
      bmi_uw_desc:'તમે તંદુરસ્ત વજન શ્રેણી નીચે છો. પોષક આહાર પર ધ્યાન આપો.',
      bmi_nw_desc:'સરસ! તમે તંદુરસ્ત વજન શ્રેણીમાં છો. સંતુલિત આહાર જાળવો.',
      bmi_ow_desc:'તમે તંદુરસ્ત વજન શ્રેણી ઉપર છો. કેલરી ઘટાડો અને કસરત વધારો.',
      bmi_ob_desc:'તમારો BMI સ્થૂળતા દર્શાવે છે. કૃપયા ડૉક્ટરની સલાહ લો.',
      confirm_clear:'બધો ચેટ ઇતિહાસ કાઢી નાખવો?', alert_bmi_invalid:'કૃપયા યોગ્ય વજન અને ઊંચાઈ દાખલ કરો.',
      alert_barcode_fail:'બારકોડ શોધી શકાયો નહીં. ફરી પ્રયાસ કરો.',
      fit_title:'જિમ અને ફિટનેસ ડાયેટ', daily_tip:'દૈનિક સ્વાસ્થ્ય ટિપ',
      pre_wo:'પ્રી-વર્કઆઉટ ખોરાક', pre_wo_sub:'તાલીમ પહેલાં 30-60 મિનિટ ખાઓ',
      post_wo:'પોસ્ટ-વર્કઆઉટ ખોરાક', post_wo_sub:'તાલીમ પછી 30 મિનિટમાં ખાઓ',
      gym_tips:'નવા શીખનાર જિમ ટિપ્સ', weekly_diet:'સાપ્તાહિક ડાયેટ પ્લાન',
      diet_day:'દિવસ', diet_bf:'નાસ્તો', diet_lunch:'લંચ', diet_dinner:'ડિનર',
      nut_title:'પોષણ જ્ઞાન કેન્દ્ર', nut_desc:'આવશ્યક વિટામિન્સ અને પોષક તત્વો વિશે જાણો.',
      vit_func:'કાર્યો', vit_def:'ઉણપના લક્ષણો', vit_src:'શ્રેષ્ઠ કુદરતી સ્ત્રોતો'
    },
    ta: {
      nav_home:'முகப்பு', nav_chat:'ஏஐ அரட்டை', nav_weight:'எடை', nav_fitness:'ஃபிட்னஸ்', nav_nutrition:'ஊட்டச்சத்து',
      chat_title:'ஏஐ ஹெல்த் அசிஸ்டன்ட்', chat_clear:'அழி', chat_placeholder:'ஆரோக்கியம் பற்றி கேளுங்கள்...',
      chat_w1:'👋 வணக்கம்! நான் உங்கள் <strong>ஏஐ ஹெல்த் அசிஸ்டன்ட்</strong>.', chat_w2:'என்னிடம் எதையும் கேளுங்கள்:',
      chat_w3:'🔍 பொருள் பகுப்பாய்வு', chat_w4:'🥗 உணவு ஆலோசனை', chat_w5:'⚖️ எடை குறிப்புகள்', chat_w6:'💪 ஃபிட்னஸ் ஊட்டச்சத்து', chat_w7:'💊 வைட்டமின் தகவல்', chat_w8:'கீழே உங்கள் கேள்வியை தட்டச்சு செய்யுங்கள்!',
      weight_title:'எடை மேலாண்மை', wl_btn:'எடை இழப்பு', wg_btn:'எடை அதிகரிப்பு',
      fat_tips:'கொழுப்பு குறைப்பு', foods_avoid:'தவிர்க்க வேண்டியவை', muscle_tips:'தசை வளர்ப்பு', hc_foods:'அதிக கலோரி உணவுகள்',
      bmi_title:'BMI கால்குலேட்டர்', bmi_wt:'எடை (kg)', bmi_ht:'உயரம் (cm)', bmi_calc:'BMI கணக்கிடு',
      bmi_uw:'குறைவான எடை', bmi_nw:'சாதாரண', bmi_ow:'அதிக எடை', bmi_ob:'உடல்பருமன்',
      bmi_uw_desc:'நீங்கள் ஆரோக்கியமான எடை வரம்புக்குக் கீழே உள்ளீர்கள். ஊட்டச்சத்துள்ள உணவில் கவனம் செலுத்துங்கள்.',
      bmi_nw_desc:'நல்லது! நீங்கள் ஆரோக்கியமான எடை வரம்பில் உள்ளீர்கள்.',
      bmi_ow_desc:'நீங்கள் ஆரோக்கியமான எடை வரம்புக்கு மேலே உள்ளீர்கள். கலோரி குறைத்து உடற்பயிற்சி அதிகரிக்கவும்.',
      bmi_ob_desc:'உங்கள் BMI உடல்பருமனைக் குறிக்கிறது. மருத்துவரை அணுகவும்.',
      confirm_clear:'அனைத்து அரட்டை வரலாற்றையும் நீக்கவா?', alert_bmi_invalid:'சரியான எடை மற்றும் உயரத்தை உள்ளிடவும்.',
      alert_barcode_fail:'பார்கோடு கண்டறிய முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
      fit_title:'ஜிம் & ஃபிட்னஸ் டயட்', daily_tip:'தினசரி ஆரோக்கிய குறிப்பு',
      pre_wo:'வொர்க்அவுட் முன் உணவு', pre_wo_sub:'பயிற்சிக்கு 30-60 நிமிடங்களுக்கு முன்',
      post_wo:'வொர்க்அவுட் பின் உணவு', post_wo_sub:'பயிற்சிக்குப் பின் 30 நிமிடத்தில்',
      gym_tips:'ஆரம்ப ஜிம் குறிப்புகள்', weekly_diet:'வாராந்திர உணவுத் திட்டம்',
      diet_day:'நாள்', diet_bf:'காலை உணவு', diet_lunch:'மதிய உணவு', diet_dinner:'இரவு உணவு',
      nut_title:'ஊட்டச்சத்து அறிவு மையம்', nut_desc:'அத்தியாவசிய வைட்டமின்கள் பற்றி அறியுங்கள்.',
      vit_func:'செயல்பாடுகள்', vit_def:'குறைபாட்டு அறிகுறிகள்', vit_src:'சிறந்த இயற்கை ஆதாரங்கள்'
    },
    te: {
      nav_home:'హోమ్', nav_chat:'ఏఐ చాట్', nav_weight:'బరువు', nav_fitness:'ఫిట్‌నెస్', nav_nutrition:'పోషణ',
      chat_title:'ఏఐ హెల్త్ అసిస్టెంట్', chat_clear:'క్లియర్', chat_placeholder:'ఆరోగ్యం గురించి అడగండి...',
      chat_w1:'👋 హలో! నేను మీ <strong>ఏఐ హెల్త్ అసిస్టెంట్</strong>.', chat_w2:'నన్ను ఏదైనా అడగండి:',
      chat_w3:'🔍 ఉత్పత్తి విశ్లేషణ', chat_w4:'🥗 ఆహార సలహా', chat_w5:'⚖️ బరువు చిట్కాలు', chat_w6:'💪 ఫిట్‌నెస్ పోషణ', chat_w7:'💊 విటమిన్ సమాచారం', chat_w8:'కింద మీ ప్రశ్న టైప్ చేయండి!',
      weight_title:'బరువు నిర్వహణ', wl_btn:'బరువు తగ్గడం', wg_btn:'బరువు పెరగడం',
      fat_tips:'ఫ్యాట్ లాస్ టిప్స్', foods_avoid:'నివారించాల్సినవి', muscle_tips:'కండర నిర్మాణ టిప్స్', hc_foods:'అధిక కేలరీ ఆహారాలు',
      bmi_title:'BMI కాల్క్యులేటర్', bmi_wt:'బరువు (kg)', bmi_ht:'ఎత్తు (cm)', bmi_calc:'BMI లెక్కించండి',
      bmi_uw:'తక్కువ బరువు', bmi_nw:'సాధారణ', bmi_ow:'అధిక బరువు', bmi_ob:'ఊబకాయం',
      bmi_uw_desc:'మీరు ఆరోగ్యకరమైన బరువు పరిధి కంటే తక్కువగా ఉన్నారు. పోషక ఆహారంపై దృష్టి పెట్టండి.',
      bmi_nw_desc:'బాగుంది! మీరు ఆరోగ్యకరమైన బరువు పరిధిలో ఉన్నారు.',
      bmi_ow_desc:'మీరు ఆరోగ్యకరమైన బరువు పరిధి కంటే ఎక్కువగా ఉన్నారు. కేలరీలు తగ్గించి వ్యాయామం పెంచండి.',
      bmi_ob_desc:'మీ BMI ఊబకాయాన్ని సూచిస్తుంది. దయచేసి వైద్యుడిని సంప్రదించండి.',
      confirm_clear:'మొత్తం చాట్ చరిత్ర తొలగించాలా?', alert_bmi_invalid:'దయచేసి సరైన బరువు మరియు ఎత్తు నమోదు చేయండి.',
      alert_barcode_fail:'బార్‌కోడ్ గుర్తించలేకపోయింది. మళ్ళీ ప్రయత్నించండి.',
      fit_title:'జిమ్ & ఫిట్‌నెస్ డైట్', daily_tip:'రోజువారీ ఆరోగ్య చిట్కా',
      pre_wo:'వర్కౌట్ ముందు ఆహారం', pre_wo_sub:'శిక్షణకు 30-60 ని. ముందు',
      post_wo:'వర్కౌట్ తర్వాత ఆహారం', post_wo_sub:'శిక్షణ తర్వాత 30 ని.లో',
      gym_tips:'బిగినర్ జిమ్ టిప్స్', weekly_diet:'వారపు ఆహార ప్రణాళిక',
      diet_day:'రోజు', diet_bf:'అల్పాహారం', diet_lunch:'భోజనం', diet_dinner:'రాత్రి భోజనం',
      nut_title:'పోషణ జ్ఞాన కేంద్రం', nut_desc:'అవసరమైన విటమిన్లు మరియు పోషకాల గురించి తెలుసుకోండి.',
      vit_func:'విధులు', vit_def:'లోపం లక్షణాలు', vit_src:'ఉత్తమ సహజ మూలాలు'
    },
    bn: {
      nav_home:'হোম', nav_chat:'এআই চ্যাট', nav_weight:'ওজন', nav_fitness:'ফিটনেস', nav_nutrition:'পুষ্টি',
      chat_title:'এআই হেলথ অ্যাসিস্ট্যান্ট', chat_clear:'মুছুন', chat_placeholder:'স্বাস্থ্য সম্পর্কে জিজ্ঞাসা করুন...',
      chat_w1:'👋 হ্যালো! আমি আপনার <strong>এআই হেলথ অ্যাসিস্ট্যান্ট</strong>।', chat_w2:'আমাকে যেকোনো কিছু জিজ্ঞাসা করুন:',
      chat_w3:'🔍 পণ্য বিশ্লেষণ', chat_w4:'🥗 খাদ্য পরামর্শ', chat_w5:'⚖️ ওজন টিপস', chat_w6:'💪 ফিটনেস পুষ্টি', chat_w7:'💊 ভিটামিন তথ্য', chat_w8:'নিচে আপনার প্রশ্ন টাইপ করুন!',
      weight_title:'ওজন পরিচালনা', wl_btn:'ওজন কমানো', wg_btn:'ওজন বাড়ানো',
      fat_tips:'ফ্যাট লস টিপস', foods_avoid:'এড়িয়ে চলুন', muscle_tips:'পেশী গঠন টিপস', hc_foods:'উচ্চ ক্যালোরি খাবার',
      bmi_title:'BMI ক্যালকুলেটর', bmi_wt:'ওজন (কেজি)', bmi_ht:'উচ্চতা (সেমি)', bmi_calc:'BMI গণনা করুন',
      bmi_uw:'কম ওজন', bmi_nw:'স্বাভাবিক', bmi_ow:'বেশি ওজন', bmi_ob:'স্থূলতা',
      bmi_uw_desc:'আপনি স্বাস্থ্যকর ওজন সীমার নিচে আছেন। পুষ্টিকর খাবারে মনোযোগ দিন।',
      bmi_nw_desc:'দুর্দান্ত! আপনি স্বাস্থ্যকর ওজন সীমায় আছেন।',
      bmi_ow_desc:'আপনি স্বাস্থ্যকর ওজন সীমার উপরে আছেন। ক্যালোরি কমান ও ব্যায়াম বাড়ান।',
      bmi_ob_desc:'আপনার BMI স্থূলতা নির্দেশ করে। দয়া করে চিকিৎসকের পরামর্শ নিন।',
      confirm_clear:'সমস্ত চ্যাট ইতিহাস মুছে ফেলবেন?', alert_bmi_invalid:'সঠিক ওজন ও উচ্চতা দিন।',
      alert_barcode_fail:'বারকোড শনাক্ত করা যায়নি। আবার চেষ্টা করুন।',
      fit_title:'জিম ও ফিটনেস ডায়েট', daily_tip:'দৈনিক স্বাস্থ্য টিপ',
      pre_wo:'ওয়ার্কআউটের আগে', pre_wo_sub:'প্রশিক্ষণের 30-60 মিনিট আগে',
      post_wo:'ওয়ার্কআউটের পরে', post_wo_sub:'প্রশিক্ষণের 30 মিনিটের মধ্যে',
      gym_tips:'নতুনদের জিম টিপস', weekly_diet:'সাপ্তাহিক ডায়েট প্ল্যান',
      diet_day:'দিন', diet_bf:'সকাল', diet_lunch:'দুপুর', diet_dinner:'রাত',
      nut_title:'পুষ্টি জ্ঞান কেন্দ্র', nut_desc:'প্রয়োজনীয় ভিটামিন ও পুষ্টি সম্পর্কে জানুন।',
      vit_func:'কার্যাবলী', vit_def:'ঘাটতির লক্ষণ', vit_src:'সেরা প্রাকৃতিক উৎস'
    },
    kn: {
      nav_home:'ಹೋಮ್', nav_chat:'ಎಐ ಚಾಟ್', nav_weight:'ತೂಕ', nav_fitness:'ಫಿಟ್‌ನೆಸ್', nav_nutrition:'ಪೋಷಣೆ',
      chat_title:'ಎಐ ಹೆಲ್ತ್ ಅಸಿಸ್ಟೆಂಟ್', chat_clear:'ಅಳಿಸಿ', chat_placeholder:'ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಕೇಳಿ...',
      chat_w1:'👋 ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ <strong>ಎಐ ಹೆಲ್ತ್ ಅಸಿಸ್ಟೆಂಟ್</strong>.', chat_w2:'ನನ್ನನ್ನು ಏನಾದರೂ ಕೇಳಿ:',
      chat_w3:'🔍 ಉತ್ಪನ್ನ ವಿಶ್ಲೇಷಣೆ', chat_w4:'🥗 ಆಹಾರ ಸಲಹೆ', chat_w5:'⚖️ ತೂಕ ಸಲಹೆಗಳು', chat_w6:'💪 ಫಿಟ್‌ನೆಸ್ ಪೋಷಣೆ', chat_w7:'💊 ವಿಟಮಿನ್ ಮಾಹಿತಿ', chat_w8:'ಕೆಳಗೆ ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ!',
      weight_title:'ತೂಕ ನಿರ್ವಹಣೆ', wl_btn:'ತೂಕ ಇಳಿಕೆ', wg_btn:'ತೂಕ ಹೆಚ್ಚಳ',
      fat_tips:'ಫ್ಯಾಟ್ ಲಾಸ್ ಟಿಪ್ಸ್', foods_avoid:'ತಪ್ಪಿಸಬೇಕಾದ ಆಹಾರ', muscle_tips:'ಸ್ನಾಯು ನಿರ್ಮಾಣ', hc_foods:'ಹೆಚ್ಚಿನ ಕ್ಯಾಲೋರಿ ಆಹಾರ',
      bmi_title:'BMI ಕ್ಯಾಲ್ಕ್ಯುಲೇಟರ್', bmi_wt:'ತೂಕ (kg)', bmi_ht:'ಎತ್ತರ (cm)', bmi_calc:'BMI ಲೆಕ್ಕ ಹಾಕಿ',
      bmi_uw:'ಕಡಿಮೆ ತೂಕ', bmi_nw:'ಸಾಮಾನ್ಯ', bmi_ow:'ಅಧಿಕ ತೂಕ', bmi_ob:'ಸ್ಥೂಲಕಾಯ',
      bmi_uw_desc:'ನೀವು ಆರೋಗ್ಯಕರ ತೂಕ ಶ್ರೇಣಿಗಿಂತ ಕಡಿಮೆ ಇದ್ದೀರಿ. ಪೋಷಕ ಆಹಾರದ ಮೇಲೆ ಗಮನ ಹರಿಸಿ.',
      bmi_nw_desc:'ಅದ್ಭುತ! ನೀವು ಆರೋಗ್ಯಕರ ತೂಕ ಶ್ರೇಣಿಯಲ್ಲಿದ್ದೀರಿ.',
      bmi_ow_desc:'ನೀವು ಆರೋಗ್ಯಕರ ತೂಕ ಶ್ರೇಣಿಗಿಂತ ಮೇಲಿದ್ದೀರಿ. ಕ್ಯಾಲೋರಿ ಕಡಿಮೆ ಮಾಡಿ ವ್ಯಾಯಾಮ ಹೆಚ್ಚಿಸಿ.',
      bmi_ob_desc:'ನಿಮ್ಮ BMI ಸ್ಥೂಲಕಾಯವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ದಯವಿಟ್ಟು ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
      confirm_clear:'ಎಲ್ಲಾ ಚಾಟ್ ಇತಿಹಾಸ ಅಳಿಸಬೇಕೇ?', alert_bmi_invalid:'ದಯವಿಟ್ಟು ಸರಿಯಾದ ತೂಕ ಮತ್ತು ಎತ್ತರ ನಮೂದಿಸಿ.',
      alert_barcode_fail:'ಬಾರ್‌ಕೋಡ್ ಪತ್ತೆಯಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
      fit_title:'ಜಿಮ್ & ಫಿಟ್‌ನೆಸ್ ಡಯಟ್', daily_tip:'ದೈನಿಕ ಆರೋಗ್ಯ ಸಲಹೆ',
      pre_wo:'ವ್ಯಾಯಾಮದ ಮೊದಲು', pre_wo_sub:'ತರಬೇತಿಗೆ 30-60 ನಿ. ಮೊದಲು',
      post_wo:'ವ್ಯಾಯಾಮದ ನಂತರ', post_wo_sub:'ತರಬೇತಿಯ 30 ನಿ. ಒಳಗೆ',
      gym_tips:'ಆರಂಭಿಕ ಜಿಮ್ ಟಿಪ್ಸ್', weekly_diet:'ವಾರದ ಆಹಾರ ಯೋಜನೆ',
      diet_day:'ದಿನ', diet_bf:'ಉಪಹಾರ', diet_lunch:'ಮಧ್ಯಾಹ್ನ', diet_dinner:'ರಾತ್ರಿ',
      nut_title:'ಪೋಷಣೆ ಜ್ಞಾನ ಕೇಂದ್ರ', nut_desc:'ಅಗತ್ಯ ವಿಟಮಿನ್‌ಗಳ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ.',
      vit_func:'ಕಾರ್ಯಗಳು', vit_def:'ಕೊರತೆ ಲಕ್ಷಣಗಳು', vit_src:'ಉತ್ತಮ ನೈಸರ್ಗಿಕ ಮೂಲಗಳು'
    },
    ml: {
      nav_home:'ഹോം', nav_chat:'എഐ ചാറ്റ്', nav_weight:'ഭാരം', nav_fitness:'ഫിറ്റ്നസ്', nav_nutrition:'പോഷകാഹാരം',
      chat_title:'എഐ ഹെൽത്ത് അസിസ്റ്റന്റ്', chat_clear:'ക്ലിയർ', chat_placeholder:'ആരോഗ്യത്തെക്കുറിച്ച് ചോദിക്കൂ...',
      chat_w1:'👋 ഹലോ! ഞാൻ നിങ്ങളുടെ <strong>എഐ ഹെൽത്ത് അസിസ്റ്റന്റ്</strong>.', chat_w2:'എന്നോട് എന്തും ചോദിക്കൂ:',
      chat_w3:'🔍 ഉത്പന്ന വിശകലനം', chat_w4:'🥗 ആഹാര ഉപദേശം', chat_w5:'⚖️ ഭാരം ടിപ്സ്', chat_w6:'💪 ഫിറ്റ്നസ് പോഷണം', chat_w7:'💊 വിറ്റമിൻ വിവരം', chat_w8:'താഴെ നിങ്ങളുടെ ചോദ്യം ടൈപ്പ് ചെയ്യൂ!',
      weight_title:'ഭാരം നിയന്ത്രണം', wl_btn:'ഭാരം കുറയ്ക്കൽ', wg_btn:'ഭാരം കൂട്ടൽ',
      fat_tips:'ഫാറ്റ് ലോസ് ടിപ്സ്', foods_avoid:'ഒഴിവാക്കേണ്ടവ', muscle_tips:'പേശി നിർമ്മാണം', hc_foods:'ഉയർന്ന കലോറി ഭക്ഷണം',
      bmi_title:'BMI കാൽക്കുലേറ്റർ', bmi_wt:'ഭാരം (kg)', bmi_ht:'ഉയരം (cm)', bmi_calc:'BMI കണക്കാക്കൂ',
      bmi_uw:'കുറഞ്ഞ ഭാരം', bmi_nw:'സാധാരണ', bmi_ow:'അമിത ഭാരം', bmi_ob:'അമിതവണ്ണം',
      bmi_uw_desc:'നിങ്ങൾ ആരോഗ്യകരമായ ഭാരപരിധിക്ക് താഴെയാണ്. പോഷകാഹാരത്തിൽ ശ്രദ്ധിക്കുക.',
      bmi_nw_desc:'നല്ലത്! നിങ്ങൾ ആരോഗ്യകരമായ ഭാരപരിധിയിലാണ്.',
      bmi_ow_desc:'നിങ്ങൾ ആരോഗ്യകരമായ ഭാരപരിധിക്ക് മുകളിലാണ്. കലോറി കുറയ്ക്കുക, വ്യായാമം വർദ്ധിപ്പിക്കുക.',
      bmi_ob_desc:'നിങ്ങളുടെ BMI അമിതവണ്ണം സൂചിപ്പിക്കുന്നു. ദയവായി ഡോക്ടറെ സമീപിക്കുക.',
      confirm_clear:'എല്ലാ ചാറ്റ് ചരിത്രവും ഇല്ലാതാക്കണോ?', alert_bmi_invalid:'ശരിയായ ഭാരവും ഉയരവും നൽകുക.',
      alert_barcode_fail:'ബാർകോഡ് കണ്ടെത്താനായില്ല. വീണ്ടും ശ്രമിക്കുക.',
      fit_title:'ജിം & ഫിറ്റ്നസ് ഡയറ്റ്', daily_tip:'ദൈനംദിന ആരോഗ്യ ടിപ്',
      pre_wo:'വ്യായാമത്തിന് മുമ്പ്', pre_wo_sub:'പരിശീലനത്തിന് 30-60 മി. മുമ്പ്',
      post_wo:'വ്യായാമത്തിന് ശേഷം', post_wo_sub:'പരിശീലനത്തിന് 30 മി. ഉള്ളിൽ',
      gym_tips:'തുടക്കക്കാർക്ക് ജിം ടിപ്സ്', weekly_diet:'പ്രതിവാര ഡയറ്റ് പ്ലാൻ',
      diet_day:'ദിവസം', diet_bf:'പ്രഭാതഭക്ഷണം', diet_lunch:'ഉച്ചഭക്ഷണം', diet_dinner:'അത്താഴം',
      nut_title:'പോഷക വിജ്ഞാന കേന്ദ്രം', nut_desc:'അത്യാവശ്യ വിറ്റമിനുകളെക്കുറിച്ച് അറിയുക.',
      vit_func:'പ്രവർത്തനങ്ങൾ', vit_def:'കുറവിന്റെ ലക്ഷണങ്ങൾ', vit_src:'മികച്ച പ്രകൃതിദത്ത സ്രോതസ്സുകൾ'
    },
    pa: {
      nav_home:'ਹੋਮ', nav_chat:'ਏਆਈ ਚੈਟ', nav_weight:'ਭਾਰ', nav_fitness:'ਫਿਟਨੈਸ', nav_nutrition:'ਪੋਸ਼ਣ',
      chat_title:'ਏਆਈ ਹੈਲਥ ਅਸਿਸਟੈਂਟ', chat_clear:'ਮਿਟਾਓ', chat_placeholder:'ਸਿਹਤ ਬਾਰੇ ਪੁੱਛੋ...',
      chat_w1:'👋 ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ <strong>ਏਆਈ ਹੈਲਥ ਅਸਿਸਟੈਂਟ</strong> ਹਾਂ।', chat_w2:'ਮੈਨੂੰ ਕੁਝ ਵੀ ਪੁੱਛੋ:',
      chat_w3:'🔍 ਉਤਪਾਦ ਵਿਸ਼ਲੇਸ਼ਣ', chat_w4:'🥗 ਡਾਈਟ ਸਲਾਹ', chat_w5:'⚖️ ਭਾਰ ਸੁਝਾਅ', chat_w6:'💪 ਫਿਟਨੈਸ ਪੋਸ਼ਣ', chat_w7:'💊 ਵਿਟਾਮਿਨ ਜਾਣਕਾਰੀ', chat_w8:'ਹੇਠਾਂ ਆਪਣਾ ਸਵਾਲ ਟਾਈਪ ਕਰੋ!',
      weight_title:'ਭਾਰ ਪ੍ਰਬੰਧਨ', wl_btn:'ਭਾਰ ਘਟਾਓ', wg_btn:'ਭਾਰ ਵਧਾਓ',
      fat_tips:'ਫੈਟ ਲੌਸ ਟਿਪਸ', foods_avoid:'ਪਰਹੇਜ਼ ਕਰੋ', muscle_tips:'ਮਾਸਪੇਸ਼ੀ ਨਿਰਮਾਣ', hc_foods:'ਉੱਚ ਕੈਲੋਰੀ ਭੋਜਨ',
      bmi_title:'BMI ਕੈਲਕੁਲੇਟਰ', bmi_wt:'ਭਾਰ (kg)', bmi_ht:'ਕੱਦ (cm)', bmi_calc:'BMI ਗਿਣੋ',
      bmi_uw:'ਘੱਟ ਭਾਰ', bmi_nw:'ਸਾਧਾਰਨ', bmi_ow:'ਵੱਧ ਭਾਰ', bmi_ob:'ਮੋਟਾਪਾ',
      bmi_uw_desc:'ਤੁਸੀਂ ਸਿਹਤਮੰਦ ਭਾਰ ਸੀਮਾ ਤੋਂ ਹੇਠਾਂ ਹੋ। ਪੋਸ਼ਕ ਭੋਜਨ ਖਾਓ।',
      bmi_nw_desc:'ਵਧੀਆ! ਤੁਸੀਂ ਸਿਹਤਮੰਦ ਭਾਰ ਸੀਮਾ ਵਿੱਚ ਹੋ।',
      bmi_ow_desc:'ਤੁਸੀਂ ਸਿਹਤਮੰਦ ਭਾਰ ਸੀਮਾ ਤੋਂ ਉੱਪਰ ਹੋ। ਕੈਲੋਰੀ ਘਟਾਓ ਅਤੇ ਕਸਰਤ ਵਧਾਓ।',
      bmi_ob_desc:'ਤੁਹਾਡਾ BMI ਮੋਟਾਪਾ ਦਰਸਾਉਂਦਾ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।',
      confirm_clear:'ਸਾਰਾ ਚੈਟ ਇਤਿਹਾਸ ਮਿਟਾਉਣਾ ਹੈ?', alert_bmi_invalid:'ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ ਭਾਰ ਅਤੇ ਕੱਦ ਦਾਖਲ ਕਰੋ।',
      alert_barcode_fail:'ਬਾਰਕੋਡ ਲੱਭ ਨਹੀਂ ਸਕਿਆ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      fit_title:'ਜਿਮ ਅਤੇ ਫਿਟਨੈਸ ਡਾਈਟ', daily_tip:'ਰੋਜ਼ਾਨਾ ਸਿਹਤ ਟਿਪ',
      pre_wo:'ਵਰਕਆਊਟ ਤੋਂ ਪਹਿਲਾਂ', pre_wo_sub:'ਸਿਖਲਾਈ ਤੋਂ 30-60 ਮਿ. ਪਹਿਲਾਂ',
      post_wo:'ਵਰਕਆਊਟ ਤੋਂ ਬਾਅਦ', post_wo_sub:'ਸਿਖਲਾਈ ਤੋਂ 30 ਮਿ. ਅੰਦਰ',
      gym_tips:'ਸ਼ੁਰੂਆਤੀ ਜਿਮ ਟਿਪਸ', weekly_diet:'ਹਫ਼ਤਾਵਾਰੀ ਡਾਈਟ ਪਲਾਨ',
      diet_day:'ਦਿਨ', diet_bf:'ਨਾਸ਼ਤਾ', diet_lunch:'ਦੁਪਹਿਰ', diet_dinner:'ਰਾਤ',
      nut_title:'ਪੋਸ਼ਣ ਗਿਆਨ ਕੇਂਦਰ', nut_desc:'ਜ਼ਰੂਰੀ ਵਿਟਾਮਿਨ ਅਤੇ ਪੋਸ਼ਕ ਤੱਤਾਂ ਬਾਰੇ ਜਾਣੋ।',
      vit_func:'ਕਾਰਜ', vit_def:'ਕਮੀ ਦੇ ਲੱਛਣ', vit_src:'ਸਭ ਤੋਂ ਵਧੀਆ ਕੁਦਰਤੀ ਸਰੋਤ'
    }
  };

  function mt(key) {
    const lang = (typeof AppState !== 'undefined' && AppState.currentLang) ? AppState.currentLang : 'en';
    return (MI[lang] && MI[lang][key]) || MI.en[key] || key;
  }

  // ==========================================
  // UPDATE ALL MODULE UI TEXT FOR CURRENT LANG
  // ==========================================
  function updateModulesLanguage() {
    // Bottom nav
    document.querySelectorAll('.ps-nav-item').forEach(btn => {
      const panel = btn.getAttribute('data-panel');
      const span = btn.querySelector('span');
      if (span && panel) {
        const key = 'nav_' + panel;
        if (key === 'nav_home') span.textContent = mt('nav_home');
        else if (key === 'nav_chat') span.textContent = mt('nav_chat');
        else if (key === 'nav_weight') span.textContent = mt('nav_weight');
        else if (key === 'nav_fitness') span.textContent = mt('nav_fitness');
        else if (key === 'nav_nutrition') span.textContent = mt('nav_nutrition');
      }
    });

    // Chat panel
    const chatH = document.querySelector('#psChatPanel .ps-panel-header h2');
    if (chatH) chatH.innerHTML = `<i data-lucide="bot"></i> ${mt('chat_title')}`;
    const clearBtn = document.getElementById('psClearChat');
    if (clearBtn) clearBtn.innerHTML = `<i data-lucide="trash-2"></i> ${mt('chat_clear')}`;
    const chatInput = document.getElementById('psChatInput');
    if (chatInput) chatInput.placeholder = mt('chat_placeholder');

    // Weight panel
    const weightH = document.querySelector('#psWeightPanel .ps-panel-header h2');
    if (weightH) weightH.innerHTML = `<i data-lucide="weight"></i> ${mt('weight_title')}`;
    document.querySelectorAll('#psWeightPanel .ps-mode-btn').forEach(btn => {
      const mode = btn.getAttribute('data-mode');
      if (mode === 'loss') btn.innerHTML = `<i data-lucide="flame"></i> ${mt('wl_btn')}`;
      if (mode === 'gain') btn.innerHTML = `<i data-lucide="trending-up"></i> ${mt('wg_btn')}`;
    });
    // Weight section titles
    const wSections = document.querySelectorAll('#psWeightPanel .ps-panel-section-title');
    if (wSections[0]) wSections[0].innerHTML = `<i data-lucide="flame"></i> ${mt('fat_tips')}`;
    if (wSections[1]) wSections[1].innerHTML = `<i data-lucide="ban"></i> ${mt('foods_avoid')}`;
    if (wSections[2]) wSections[2].innerHTML = `<i data-lucide="calculator"></i> ${mt('bmi_title')}`;
    if (wSections[3]) wSections[3].innerHTML = `<i data-lucide="trending-up"></i> ${mt('muscle_tips')}`;
    if (wSections[4]) wSections[4].innerHTML = `<i data-lucide="utensils"></i> ${mt('hc_foods')}`;
    // BMI labels
    const bmiLabels = document.querySelectorAll('#psBmiPanel .ps-bmi-field label');
    if (bmiLabels[0]) bmiLabels[0].textContent = mt('bmi_wt');
    if (bmiLabels[1]) bmiLabels[1].textContent = mt('bmi_ht');
    const bmiBtn = document.getElementById('psBmiCalc');
    if (bmiBtn) bmiBtn.innerHTML = `<i data-lucide="calculator"></i> ${mt('bmi_calc')}`;
    const bmiBarLabels = document.querySelectorAll('#psBmiPanel .ps-bmi-labels span');
    if (bmiBarLabels[0]) bmiBarLabels[0].textContent = mt('bmi_uw');
    if (bmiBarLabels[1]) bmiBarLabels[1].textContent = mt('bmi_nw');
    if (bmiBarLabels[2]) bmiBarLabels[2].textContent = mt('bmi_ow');
    if (bmiBarLabels[3]) bmiBarLabels[3].textContent = mt('bmi_ob');

    // Fitness panel
    const fitH = document.querySelector('#psFitnessPanel .ps-panel-header h2');
    if (fitH) fitH.innerHTML = `<i data-lucide="dumbbell"></i> ${mt('fit_title')}`;
    const fSections = document.querySelectorAll('#psFitnessPanel .ps-panel-section-title');
    if (fSections[0]) fSections[0].innerHTML = `<i data-lucide="zap"></i> ${mt('pre_wo')}`;
    if (fSections[1]) fSections[1].innerHTML = `<i data-lucide="battery-charging"></i> ${mt('post_wo')}`;
    if (fSections[2]) fSections[2].innerHTML = `<i data-lucide="target"></i> ${mt('gym_tips')}`;
    if (fSections[3]) fSections[3].innerHTML = `<i data-lucide="calendar-days"></i> ${mt('weekly_diet')}`;
    // Pre/post workout subtitles
    const fSubs = document.querySelectorAll('#psFitnessPanel .ps-panel-body > p');
    if (fSubs[0]) fSubs[0].textContent = mt('pre_wo_sub');
    if (fSubs[1]) fSubs[1].textContent = mt('post_wo_sub');
    // Daily tip card heading
    const tipH = document.querySelector('#psDailyTipCard > h3');
    if (tipH) tipH.innerHTML = `<i data-lucide="lightbulb"></i> ${mt('daily_tip')}`;
    // Diet table headers
    const thCells = document.querySelectorAll('#psFitnessPanel .ps-diet-table th');
    if (thCells[0]) thCells[0].textContent = mt('diet_day');
    if (thCells[1]) thCells[1].textContent = mt('diet_bf');
    if (thCells[2]) thCells[2].textContent = mt('diet_lunch');
    if (thCells[3]) thCells[3].textContent = mt('diet_dinner');

    // Nutrition panel
    const nutH = document.querySelector('#psNutritionPanel .ps-panel-header h2');
    if (nutH) nutH.innerHTML = `<i data-lucide="apple"></i> ${mt('nut_title')}`;
    const nutDesc = document.querySelector('#psNutritionPanel .ps-panel-body > p');
    if (nutDesc) nutDesc.textContent = mt('nut_desc');
    // Vitamin section titles
    document.querySelectorAll('#psNutritionPanel .ps-vitamin-section-title').forEach((el, i) => {
      if (i % 3 === 0) el.textContent = mt('vit_func');
      if (i % 3 === 1) el.textContent = mt('vit_def');
      if (i % 3 === 2) el.textContent = mt('vit_src');
    });

    // Re-init icons
    if (window.lucide) setTimeout(() => lucide.createIcons(), 50);

    // Translate ALL body content dynamically
    translateAllBodyContent();
  }

  // ==========================================
  // DYNAMIC BODY CONTENT TRANSLATION
  // ==========================================
  const BODY_CACHE_KEY = 'purescan_body_translations';
  const BODY_SELECTORS = [
    '#psWeightPanel .ps-tip-text',
    '#psWeightPanel .ps-food-name',
    '#psWeightPanel .ps-food-info',
    '#psFitnessPanel .ps-tip-text',
    '#psFitnessPanel .ps-food-name',
    '#psFitnessPanel .ps-food-info',
    '#psFitnessPanel .ps-diet-table td',
    '#psDailyTipContent h4',
    '#psDailyTipContent p',
    '#psNutritionPanel .ps-vitamin-name',
    '#psNutritionPanel .ps-vitamin-subtitle',
    '#psNutritionPanel .ps-vitamin-section p',
    '#psNutritionPanel .ps-vitamin-source-tag',
    '#psChatPanel .ps-chat-suggest-btn'
  ];

  // Store original English text for re-translation
  let originalBodyTexts = null;

  function collectBodyTexts() {
    const texts = {};
    let idx = 0;
    BODY_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        const text = el.innerHTML.trim();
        if (text && text.length > 0) {
          texts['t' + idx] = text;
          el.setAttribute('data-body-idx', idx);
          idx++;
        }
      });
    });
    return texts;
  }

  function applyBodyTranslations(translations) {
    BODY_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        const idx = el.getAttribute('data-body-idx');
        if (idx !== null && translations['t' + idx]) {
          el.innerHTML = translations['t' + idx];
        }
      });
    });
    if (window.lucide) setTimeout(() => lucide.createIcons(), 50);
  }

  function restoreOriginalTexts() {
    if (!originalBodyTexts) return;
    BODY_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        const idx = el.getAttribute('data-body-idx');
        if (idx !== null && originalBodyTexts['t' + idx]) {
          el.innerHTML = originalBodyTexts['t' + idx];
        }
      });
    });
  }

  async function translateAllBodyContent() {
    const lang = (typeof AppState !== 'undefined' && AppState.currentLang) ? AppState.currentLang : 'en';

    // Collect and store original English texts on first run
    if (!originalBodyTexts) {
      originalBodyTexts = collectBodyTexts();
    }

    // If English, restore originals and return
    if (lang === 'en') {
      restoreOriginalTexts();
      return;
    }

    // Check cache
    try {
      const cache = JSON.parse(localStorage.getItem(BODY_CACHE_KEY) || '{}');
      if (cache[lang]) {
        applyBodyTranslations(cache[lang]);
        return;
      }
    } catch(e) {}

    // Language name for API
    const LANG_NAMES = {
      'hi':'Hindi','hinglish':'Hinglish','mr':'Marathi','gu':'Gujarati',
      'ta':'Tamil','te':'Telugu','bn':'Bengali','kn':'Kannada','ml':'Malayalam','pa':'Punjabi'
    };
    const langName = LANG_NAMES[lang] || 'English';

    // Show subtle loading indicator on panels
    const panels = ['psWeightPanel','psFitnessPanel','psNutritionPanel','psChatPanel'];
    panels.forEach(id => {
      const p = document.getElementById(id);
      if (p) {
        let loader = p.querySelector('.ps-translate-loader');
        if (!loader) {
          loader = document.createElement('div');
          loader.className = 'ps-translate-loader';
          loader.innerHTML = '<div class="ps-translate-spinner"></div> Translating...';
          const body = p.querySelector('.ps-panel-body') || p;
          body.insertBefore(loader, body.firstChild);
        }
        loader.style.display = 'flex';
      }
    });

    try {
      // Split into smaller chunks to avoid token limits
      const allTexts = originalBodyTexts;
      const keys = Object.keys(allTexts);
      const CHUNK_SIZE = 40;
      const translatedAll = {};

      const chunkPromises = [];
      for (let i = 0; i < keys.length; i += CHUNK_SIZE) {
        const chunk = {};
        keys.slice(i, i + CHUNK_SIZE).forEach(k => { chunk[k] = allTexts[k]; });

        const p = fetch('/.netlify/functions/translate-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetLanguage: langName, analysisData: chunk })
        }).then(async response => {
          if (!response.ok) return {};
          let translated = await response.json();
          // LLMs sometimes wrap the response in a parent key (e.g. { "data": { "t0": "..." } })
          const firstKeyChunk = Object.keys(chunk)[0];
          if (!translated[firstKeyChunk]) {
            const findNested = (obj) => {
              if (!obj || typeof obj !== 'object') return null;
              if (obj[firstKeyChunk]) return obj;
              for (const key in obj) {
                const inner = findNested(obj[key]);
                if (inner) return inner;
              }
              return null;
            };
            const innerObj = findNested(translated);
            if (innerObj) translated = innerObj;
          }
          return translated;
        }).catch(err => ({}));
        
        chunkPromises.push(p);
      }

      const results = await Promise.all(chunkPromises);
      results.forEach(res => {
        Object.assign(translatedAll, res);
      });

      // Remove loaders early before applying to DOM
      panels.forEach(id => {
        const p = document.getElementById(id);
        if (p) {
          const loader = p.querySelector('.ps-translate-loader');
          if (loader) loader.style.display = 'none';
        }
      });

      // Apply translations
      if (Object.keys(translatedAll).length > 0) {
        applyBodyTranslations(translatedAll);

        // Cache
        try {
          const cache = JSON.parse(localStorage.getItem(BODY_CACHE_KEY) || '{}');
          cache[lang] = translatedAll;
          localStorage.setItem(BODY_CACHE_KEY, JSON.stringify(cache));
        } catch(e) {
          // Cache full - clear and retry
          localStorage.removeItem(BODY_CACHE_KEY);
        }
      }
    } catch(err) {
      console.warn('[PureScan] Body content translation failed:', err.message);
    }

    // Hide loaders
    panels.forEach(id => {
      const p = document.getElementById(id);
      if (p) {
        const loader = p.querySelector('.ps-translate-loader');
        if (loader) loader.style.display = 'none';
      }
    });
  }

  // Register for language change notifications from script.js
  window.onPureScanLanguageChange = updateModulesLanguage;

  // ==========================================
  // DAILY HEALTH TIPS DATA
  // ==========================================
  const DAILY_TIPS = [
    { emoji: '💧', title: 'Stay Hydrated', text: 'Drink at least 8 glasses (2L) of water daily. It boosts metabolism, improves skin, and helps in weight management.' },
    { emoji: '🥗', title: 'Eat the Rainbow', text: 'Include colorful fruits & vegetables daily. Each color provides different vitamins and antioxidants your body needs.' },
    { emoji: '🚶', title: '10,000 Steps', text: 'Walking 10,000 steps daily can burn ~400 calories. Start with small walks and gradually increase your daily step count.' },
    { emoji: '😴', title: 'Sleep Well', text: 'Getting 7-8 hours of quality sleep is crucial for weight management. Poor sleep increases hunger hormones.' },
    { emoji: '🍌', title: 'Potassium Power', text: 'Bananas, spinach, and sweet potatoes are rich in potassium — essential for heart health and muscle function.' },
    { emoji: '🧘', title: 'Mindful Eating', text: 'Eat slowly, chew thoroughly, and avoid screens while eating. This reduces overeating by 20-30%.' },
    { emoji: '🥚', title: 'Protein First', text: 'Start your meals with protein. It keeps you full longer and helps build lean muscle mass.' },
    { emoji: '🫒', title: 'Good Fats Matter', text: 'Include healthy fats like olive oil, nuts, and avocados. They support brain health and vitamin absorption.' },
    { emoji: '🍵', title: 'Green Tea Benefits', text: 'Green tea contains catechins that boost metabolism and aid fat burning. Have 2-3 cups daily.' },
    { emoji: '🧂', title: 'Watch Your Salt', text: 'Limit sodium to 2,300mg/day. Excess salt causes water retention, high BP, and bloating.' },
  ];

  // ==========================================
  // VITAMIN & NUTRITION DATA
  // ==========================================
  const VITAMINS_DATA = [
    {
      name: 'Vitamin A', badge: 'A', color: '#f59e0b',
      subtitle: 'Vision & Immunity',
      functions: 'Essential for good vision, immune function, skin health, and cell growth. Acts as an antioxidant protecting cells from damage.',
      deficiency: 'Night blindness, dry skin, frequent infections, poor wound healing, dry eyes.',
      sources: ['Carrots', 'Sweet Potato', 'Spinach', 'Mango', 'Eggs', 'Liver', 'Papaya']
    },
    {
      name: 'Vitamin B Complex', badge: 'B', color: '#6366f1',
      subtitle: 'Energy & Nerves',
      functions: 'B vitamins (B1-B12) help convert food into energy, support nervous system, produce red blood cells, and maintain healthy brain function.',
      deficiency: 'Fatigue, weakness, anemia, numbness in hands/feet, mouth ulcers, confusion, depression.',
      sources: ['Whole Grains', 'Eggs', 'Milk', 'Lentils', 'Chicken', 'Bananas', 'Leafy Greens']
    },
    {
      name: 'Vitamin C', badge: 'C', color: '#f97316',
      subtitle: 'Immunity & Skin',
      functions: 'Powerful antioxidant that boosts immunity, helps iron absorption, supports collagen production for healthy skin, and speeds wound healing.',
      deficiency: 'Scurvy, bleeding gums, slow wound healing, dry/rough skin, frequent colds, joint pain.',
      sources: ['Orange', 'Lemon', 'Amla', 'Guava', 'Bell Pepper', 'Kiwi', 'Strawberry']
    },
    {
      name: 'Vitamin D', badge: 'D', color: '#eab308',
      subtitle: 'Bones & Mood',
      functions: 'Critical for calcium absorption, strong bones and teeth, immune regulation, and mood balance. Often called the "sunshine vitamin".',
      deficiency: 'Bone pain, muscle weakness, fatigue, depression, frequent illness, hair loss.',
      sources: ['Sunlight', 'Fatty Fish', 'Egg Yolks', 'Mushrooms', 'Fortified Milk', 'Cheese']
    },
    {
      name: 'Vitamin E', badge: 'E', color: '#10b981',
      subtitle: 'Antioxidant & Skin',
      functions: 'Protects cells from oxidative damage, supports immune function, skin health, and acts as a natural anti-inflammatory.',
      deficiency: 'Muscle weakness, vision problems, weakened immunity, numbness and tingling.',
      sources: ['Almonds', 'Sunflower Seeds', 'Spinach', 'Peanuts', 'Avocado', 'Olive Oil']
    },
    {
      name: 'Vitamin K', badge: 'K', color: '#22c55e',
      subtitle: 'Blood & Bones',
      functions: 'Essential for blood clotting, bone metabolism, and regulating calcium levels. Helps prevent excessive bleeding.',
      deficiency: 'Easy bruising, excessive bleeding from cuts, heavy menstrual bleeding, weak bones.',
      sources: ['Kale', 'Spinach', 'Broccoli', 'Brussels Sprouts', 'Green Beans', 'Soybeans']
    },
    {
      name: 'Iron', badge: 'Fe', color: '#ef4444',
      subtitle: 'Blood & Energy',
      functions: 'Crucial for hemoglobin production, oxygen transport, energy metabolism, and cognitive function. One of the most common deficiencies.',
      deficiency: 'Anemia, fatigue, pale skin, shortness of breath, cold hands/feet, brittle nails.',
      sources: ['Spinach', 'Red Meat', 'Lentils', 'Chickpeas', 'Fortified Cereals', 'Dates', 'Jaggery']
    },
    {
      name: 'Calcium', badge: 'Ca', color: '#8b5cf6',
      subtitle: 'Bones & Teeth',
      functions: 'Building block for strong bones and teeth, nerve transmission, muscle contractions, and blood clotting.',
      deficiency: 'Osteoporosis, muscle cramps, numbness in fingers, dental problems, brittle nails.',
      sources: ['Milk', 'Curd', 'Paneer', 'Ragi', 'Broccoli', 'Sesame Seeds', 'Almonds']
    }
  ];

  // ==========================================
  // WEIGHT MANAGEMENT CONTENT
  // ==========================================
  const WEIGHT_LOSS_TIPS = [
    { emoji: '🔥', text: '<strong>Calorie Deficit:</strong> Eat 300-500 calories less than your body burns daily. This is the #1 science-backed fat loss method.' },
    { emoji: '🥩', text: '<strong>High Protein:</strong> Eat 1.6-2.2g protein per kg body weight. Protein preserves muscle and keeps you full longer.' },
    { emoji: '⏰', text: '<strong>Intermittent Fasting:</strong> Try 16:8 method — eat within 8 hours, fast for 16. Helps burn stored fat effortlessly.' },
    { emoji: '🚫', text: '<strong>Cut Processed Foods:</strong> Avoid packaged snacks, sugary drinks, and anything with palm oil. These are empty calories.' },
    { emoji: '🏃', text: '<strong>Move More:</strong> Combine strength training + cardio. Muscle burns more calories even at rest.' },
    { emoji: '📏', text: '<strong>Track Progress:</strong> Measure waist, not just weight. Muscle gain can mask fat loss on the scale.' },
  ];

  const WEIGHT_GAIN_TIPS = [
    { emoji: '📈', text: '<strong>Calorie Surplus:</strong> Eat 300-500 calories MORE than your body burns daily. Focus on nutrient-dense foods, not junk.' },
    { emoji: '💪', text: '<strong>Strength Training:</strong> Lift heavy weights 3-4 times per week. This tells your body to build muscle, not store fat.' },
    { emoji: '🥜', text: '<strong>Calorie-Dense Foods:</strong> Nuts, peanut butter, dried fruits, whole milk, cheese, and avocados are your friends.' },
    { emoji: '🍚', text: '<strong>Complex Carbs:</strong> Brown rice, oats, sweet potato, and whole wheat roti provide sustained energy for muscle growth.' },
    { emoji: '🥛', text: '<strong>Post-Workout Shake:</strong> Blend banana + milk + peanut butter + oats = 600+ calorie muscle-building shake.' },
    { emoji: '😴', text: '<strong>Rest & Sleep:</strong> Muscles grow during rest, not in the gym. Get 8 hours of sleep and take rest days.' },
  ];

  const FOODS_AVOID_LOSS = [
    { emoji: '🍟', name: 'Fried Foods', info: 'Trans fats, empty calories' },
    { emoji: '🥤', name: 'Sugary Drinks', info: '40g+ sugar per serving' },
    { emoji: '🍰', name: 'Refined Sugar', info: 'Spikes insulin, stores fat' },
    { emoji: '🍕', name: 'Processed Foods', info: 'Palm oil, preservatives' },
    { emoji: '🍞', name: 'White Bread', info: 'High glycemic index' },
    { emoji: '🧃', name: 'Packaged Juice', info: 'Added sugar, no fiber' },
  ];

  const FOODS_GAIN = [
    { emoji: '🥜', name: 'Peanut Butter', info: '588 cal / 100g' },
    { emoji: '🥛', name: 'Whole Milk', info: '149 cal / glass' },
    { emoji: '🍌', name: 'Banana Shake', info: '~400 cal / glass' },
    { emoji: '🧀', name: 'Paneer / Cheese', info: '265 cal / 100g' },
    { emoji: '🥣', name: 'Oats + Honey', info: '~350 cal / bowl' },
    { emoji: '🥚', name: 'Whole Eggs', info: '155 cal / 2 eggs' },
    { emoji: '🫘', name: 'Rajma / Chickpeas', info: '~330 cal / cup' },
    { emoji: '🍠', name: 'Sweet Potato', info: '86 cal, complex carbs' },
  ];

  // ==========================================
  // FITNESS & GYM CONTENT
  // ==========================================
  const PRE_WORKOUT_FOODS = [
    { emoji: '🍌', name: 'Banana', info: 'Quick energy, potassium' },
    { emoji: '🥣', name: 'Oatmeal', info: 'Sustained energy release' },
    { emoji: '🍞', name: 'Whole Wheat Toast', info: 'Complex carbs + fiber' },
    { emoji: '🍎', name: 'Apple + PB', info: 'Carbs + healthy fats' },
    { emoji: '☕', name: 'Black Coffee', info: 'Boosts performance 12%' },
    { emoji: '🥤', name: 'Smoothie', info: 'Quick absorption fuel' },
  ];

  const POST_WORKOUT_FOODS = [
    { emoji: '🥚', name: 'Eggs + Toast', info: 'Protein + carbs recovery' },
    { emoji: '🥛', name: 'Whey Shake', info: '25g fast protein' },
    { emoji: '🍗', name: 'Chicken + Rice', info: 'Complete recovery meal' },
    { emoji: '🍌', name: 'Banana + Curd', info: 'Glycogen replenishment' },
    { emoji: '🥜', name: 'Paneer + Roti', info: 'Indian muscle meal' },
    { emoji: '🫘', name: 'Dal + Rice', info: 'Plant-based protein combo' },
  ];

  const WEEKLY_DIET = [
    { day: 'Monday', breakfast: 'Oats + Banana + Almonds', lunch: 'Brown Rice + Dal + Salad', dinner: 'Grilled Paneer + Roti + Raita' },
    { day: 'Tuesday', breakfast: 'Egg Omelette + Toast', lunch: 'Chicken Curry + Rice', dinner: 'Moong Dal + Chapati + Veggies' },
    { day: 'Wednesday', breakfast: 'Poha + Sprouts', lunch: 'Rajma + Rice + Curd', dinner: 'Grilled Fish + Sweet Potato' },
    { day: 'Thursday', breakfast: 'Smoothie Bowl', lunch: 'Chole + Roti + Salad', dinner: 'Palak Paneer + Brown Rice' },
    { day: 'Friday', breakfast: 'Idli + Sambar + Chutney', lunch: 'Egg Curry + Roti', dinner: 'Tofu Stir-Fry + Quinoa' },
    { day: 'Saturday', breakfast: 'Besan Chilla + Curd', lunch: 'Biryani (Brown Rice) + Raita', dinner: 'Dal Tadka + Roti + Salad' },
    { day: 'Sunday', breakfast: 'Pancakes + Fruits', lunch: 'Fish Curry + Rice + Veggies', dinner: 'Soup + Grilled Chicken Salad' },
  ];

  const GYM_TIPS = [
    { emoji: '🏋️', text: '<strong>Start with Compound Exercises:</strong> Squats, Deadlifts, Bench Press, Pull-ups. These build the most muscle efficiently.' },
    { emoji: '⏱️', text: '<strong>Progressive Overload:</strong> Gradually increase weight, reps, or sets every week. Your body adapts — make it work harder.' },
    { emoji: '💧', text: '<strong>Hydrate During Workout:</strong> Drink small sips of water every 15 minutes. Dehydration drops performance by 20%.' },
    { emoji: '🔄', text: '<strong>Don\'t Skip Warm-Up:</strong> 5-10 min dynamic stretching before every session prevents injuries and improves performance.' },
    { emoji: '📊', text: '<strong>Track Your Lifts:</strong> Keep a workout journal. Consistency and tracking is the #1 difference between results and stagnation.' },
  ];

  // ==========================================
  // CHAT SUGGESTIONS
  // ==========================================
  const CHAT_SUGGESTIONS = [
    'Is Maggi healthy?',
    'Best diet for weight loss?',
    'High protein Indian foods?',
    'Pre-workout meal ideas?',
    'How to reduce belly fat?',
    'Best foods for muscle gain?',
  ];

  // ==========================================
  // INITIALIZATION — Wait for existing app
  // ==========================================
  function initHealthModules() {
    // Don't inject if already injected
    if (document.getElementById('psBottomNav')) return;

    injectBottomNav();
    injectChatPanel();
    injectWeightPanel();
    injectFitnessPanel();
    injectNutritionPanel();
    injectSmartSuggestions();
    bindNavEvents();
    initDailyTip();
    initBMI();
    initChatFromHistory();
    hookIntoScanResults();

    document.body.classList.add('ps-has-nav');

    // Apply saved language to all modules on initial load
    updateModulesLanguage();

    // Re-init lucide icons
    if (window.lucide) {
      setTimeout(() => lucide.createIcons(), 100);
    }
  }

  // Wait for the existing app to initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initHealthModules, 200));
  } else {
    setTimeout(initHealthModules, 200);
  }

  // ==========================================
  // INJECT BOTTOM NAVIGATION
  // ==========================================
  function injectBottomNav() {
    const nav = document.createElement('nav');
    nav.className = 'ps-bottom-nav';
    nav.id = 'psBottomNav';
    nav.innerHTML = `
      <button class="ps-nav-item ps-nav-active" data-panel="home" aria-label="Home">
        <i data-lucide="home"></i>
        <span>HOME</span>
      </button>
      <button class="ps-nav-item" data-panel="chat" aria-label="AI Chat">
        <div class="ai-nav-icon">AI</div>
        <span>AI CHAT</span>
      </button>
      <button class="ps-nav-item ps-nav-scan" data-panel="scan" aria-label="Scan">
        <div class="ps-scan-btn-inner">
          <i data-lucide="barcode"></i>
        </div>
      </button>
      <button class="ps-nav-item" data-panel="bmi" aria-label="BMI">
        <i data-lucide="gauge"></i>
        <span>BMI</span>
      </button>
      <button class="ps-nav-item" data-panel="profile" aria-label="Profile">
        <i data-lucide="user"></i>
        <span>PROFILE</span>
      </button>
    `;
    document.body.appendChild(nav);
  }

  // ==========================================
  // INJECT AI CHAT PANEL
  // ==========================================
  function injectChatPanel() {
    const panel = document.createElement('div');
    panel.className = 'ps-panel';
    panel.id = 'psChatPanel';
    panel.innerHTML = `
      <div class="ps-panel-header">
        <h2><i data-lucide="bot"></i> AI Health Assistant</h2>
        <div style="display:flex;gap:0.5rem;align-items:center;">
          <button class="ps-chat-history-btn" id="psClearChat" aria-label="Clear chat">
            <i data-lucide="trash-2"></i> Clear
          </button>
          <button class="ps-panel-close" id="psChatClose" aria-label="Close">✕</button>
        </div>
      </div>
      <div class="ps-chat-messages" id="psChatMessages">
        <div class="ps-chat-msg ps-msg-ai">
          <div class="ps-msg-avatar"><i data-lucide="bot"></i></div>
          <div class="ps-msg-content">
            <p>${mt('chat_w1')}</p>
            <p>${mt('chat_w2')}</p>
            <ul>
              <li>${mt('chat_w3')}</li>
              <li>${mt('chat_w4')}</li>
              <li>${mt('chat_w5')}</li>
              <li>${mt('chat_w6')}</li>
              <li>${mt('chat_w7')}</li>
            </ul>
            <p>${mt('chat_w8')}</p>
          </div>
        </div>
      </div>
      <div class="ps-chat-suggestions" id="psChatSuggestions">
        ${CHAT_SUGGESTIONS.map(s => `<button class="ps-chat-suggest-btn">${s}</button>`).join('')}
      </div>
      <div class="ps-chat-barcode-preview" id="psChatBarcodePreview">
        <i data-lucide="scan-line" class="barcode-icon"></i>
        <span class="barcode-text" id="psChatBarcodeText"></span>
        <button class="barcode-remove" id="psChatBarcodeRemove"><i data-lucide="x"></i></button>
      </div>
      <div class="ps-chat-input">
        <div class="ps-chat-input-wrapper">
          <button class="ps-chat-barcode-btn" id="psChatBarcodeBtn" aria-label="Scan Barcode">
            <i data-lucide="scan-line"></i>
          </button>
          <input type="text" id="psChatInput" placeholder="Ask about health or scan a barcode..." autocomplete="off">
        </div>
        <button class="ps-chat-send" id="psChatSend" aria-label="Send message">
          <i data-lucide="send"></i>
        </button>
      </div>
    `;
    document.body.appendChild(panel);

    // Bind chat events
    const sendBtn = document.getElementById('psChatSend');
    const input = document.getElementById('psChatInput');
    const clearBtn = document.getElementById('psClearChat');
    const barcodeBtn = document.getElementById('psChatBarcodeBtn');
    const barcodePreview = document.getElementById('psChatBarcodePreview');
    const barcodeText = document.getElementById('psChatBarcodeText');
    const barcodeRemove = document.getElementById('psChatBarcodeRemove');

    // Barcode scan button — open scanning modal
    barcodeBtn.addEventListener('click', () => openChatBarcodeModal());

    // Remove barcode preview
    barcodeRemove.addEventListener('click', () => {
      clearChatBarcode();
    });

    sendBtn.addEventListener('click', () => sendChatMessage());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (input.value.trim() || currentChatBarcode)) sendChatMessage();
    });

    clearBtn.addEventListener('click', () => {
      if (confirm(mt('confirm_clear'))) {
        localStorage.removeItem(PS_CHAT_HISTORY_KEY);
        const msgs = document.getElementById('psChatMessages');
        msgs.innerHTML = '';
        addAIWelcomeMessage();
        if (window.lucide) lucide.createIcons();
      }
    });

    // Suggestion buttons
    document.querySelectorAll('.ps-chat-suggest-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.textContent;
        sendChatMessage();
      });
    });
  }

  // ==========================================
  // INJECT WEIGHT MANAGEMENT PANEL
  // ==========================================
  function injectWeightPanel() {
    const panel = document.createElement('div');
    panel.className = 'ps-panel';
    panel.id = 'psWeightPanel';

    const lossHTML = `
      <div class="ps-mode-content ps-mode-visible" id="psWeightLossContent">
        <h3 class="ps-panel-section-title"><i data-lucide="flame"></i> Fat Loss Tips</h3>
        ${WEIGHT_LOSS_TIPS.map(t => `
          <div class="ps-tip-card">
            <div class="ps-tip-icon ps-tip-icon-red">${t.emoji}</div>
            <div class="ps-tip-text">${t.text}</div>
          </div>
        `).join('')}

        <h3 class="ps-panel-section-title"><i data-lucide="ban"></i> Foods to Avoid</h3>
        <div class="ps-food-grid">
          ${FOODS_AVOID_LOSS.map(f => `
            <div class="ps-food-card">
              <span class="ps-food-emoji">${f.emoji}</span>
              <div class="ps-food-name">${f.name}</div>
              <div class="ps-food-info">${f.info}</div>
            </div>
          `).join('')}
        </div>

      </div>
    `;

    const gainHTML = `
      <div class="ps-mode-content" id="psWeightGainContent">
        <h3 class="ps-panel-section-title"><i data-lucide="trending-up"></i> Muscle Building Tips</h3>
        ${WEIGHT_GAIN_TIPS.map(t => `
          <div class="ps-tip-card">
            <div class="ps-tip-icon ps-tip-icon-green">${t.emoji}</div>
            <div class="ps-tip-text">${t.text}</div>
          </div>
        `).join('')}

        <h3 class="ps-panel-section-title"><i data-lucide="utensils"></i> High Calorie Healthy Foods</h3>
        <div class="ps-food-grid">
          ${FOODS_GAIN.map(f => `
            <div class="ps-food-card">
              <span class="ps-food-emoji">${f.emoji}</span>
              <div class="ps-food-name">${f.name}</div>
              <div class="ps-food-info">${f.info}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    panel.innerHTML = `
      <div class="ps-panel-header">
        <h2><i data-lucide="weight"></i> Weight Management</h2>
        <button class="ps-panel-close" id="psWeightClose" aria-label="Close">✕</button>
      </div>
      <div class="ps-panel-body">
        <div class="ps-mode-toggle">
          <button class="ps-mode-btn ps-mode-active" data-mode="loss">
            <i data-lucide="flame"></i> Weight Loss
          </button>
          <button class="ps-mode-btn" data-mode="gain">
            <i data-lucide="trending-up"></i> Weight Gain
          </button>
        </div>
        ${lossHTML}
        ${gainHTML}
      </div>
    `;
    document.body.appendChild(panel);

    // Mode toggle
    panel.querySelectorAll('.ps-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        panel.querySelectorAll('.ps-mode-btn').forEach(b => b.classList.remove('ps-mode-active'));
        btn.classList.add('ps-mode-active');
        const mode = btn.getAttribute('data-mode');
        document.getElementById('psWeightLossContent').classList.toggle('ps-mode-visible', mode === 'loss');
        document.getElementById('psWeightGainContent').classList.toggle('ps-mode-visible', mode === 'gain');
      });
    });
  }

  // ==========================================
  // INJECT FITNESS PANEL
  // ==========================================
  function injectFitnessPanel() {
    const panel = document.createElement('div');
    panel.className = 'ps-panel';
    panel.id = 'psFitnessPanel';

    panel.innerHTML = `
      <div class="ps-panel-header">
        <h2><i data-lucide="dumbbell"></i> Gym & Fitness Diet</h2>
        <button class="ps-panel-close" id="psFitnessClose" aria-label="Close">✕</button>
      </div>
      <div class="ps-panel-body">
        <div class="ps-section-card ps-daily-tip" id="psDailyTipCard">
          <h3><i data-lucide="lightbulb"></i> Daily Health Tip</h3>
          <div id="psDailyTipContent"></div>
          <div class="ps-tip-dots" id="psTipDots">
            ${DAILY_TIPS.map((_, i) => `<span class="ps-tip-dot ${i === 0 ? 'ps-tip-dot-active' : ''}" data-tip="${i}"></span>`).join('')}
          </div>
        </div>

        <h3 class="ps-panel-section-title"><i data-lucide="zap"></i> Pre-Workout Foods</h3>
        <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:0.75rem;">Eat 30-60 minutes before training</p>
        <div class="ps-food-grid">
          ${PRE_WORKOUT_FOODS.map(f => `
            <div class="ps-food-card">
              <span class="ps-food-emoji">${f.emoji}</span>
              <div class="ps-food-name">${f.name}</div>
              <div class="ps-food-info">${f.info}</div>
            </div>
          `).join('')}
        </div>

        <h3 class="ps-panel-section-title" style="margin-top:1.5rem"><i data-lucide="battery-charging"></i> Post-Workout Foods</h3>
        <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:0.75rem;">Eat within 30 minutes after training</p>
        <div class="ps-food-grid">
          ${POST_WORKOUT_FOODS.map(f => `
            <div class="ps-food-card">
              <span class="ps-food-emoji">${f.emoji}</span>
              <div class="ps-food-name">${f.name}</div>
              <div class="ps-food-info">${f.info}</div>
            </div>
          `).join('')}
        </div>

        <h3 class="ps-panel-section-title" style="margin-top:1.5rem"><i data-lucide="target"></i> Beginner Gym Tips</h3>
        ${GYM_TIPS.map(t => `
          <div class="ps-tip-card">
            <div class="ps-tip-icon ps-tip-icon-blue">${t.emoji}</div>
            <div class="ps-tip-text">${t.text}</div>
          </div>
        `).join('')}

        <h3 class="ps-panel-section-title" style="margin-top:1.5rem"><i data-lucide="calendar-days"></i> Weekly Diet Plan</h3>
        <div class="ps-section-card" style="padding:0.5rem;overflow-x:auto;">
          <table class="ps-diet-table">
            <thead>
              <tr><th>Day</th><th>Breakfast</th><th>Lunch</th><th>Dinner</th></tr>
            </thead>
            <tbody>
              ${WEEKLY_DIET.map(d => `
                <tr>
                  <td>${d.day}</td>
                  <td>${d.breakfast}</td>
                  <td>${d.lunch}</td>
                  <td>${d.dinner}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    document.body.appendChild(panel);
  }

  // ==========================================
  // INJECT NUTRITION (VITAMIN) PANEL
  // ==========================================
  function injectNutritionPanel() {
    const panel = document.createElement('div');
    panel.className = 'ps-panel';
    panel.id = 'psNutritionPanel';

    panel.innerHTML = `
      <div class="ps-panel-header">
        <h2><i data-lucide="apple"></i> Nutrition Knowledge Hub</h2>
        <button class="ps-panel-close" id="psNutritionClose" aria-label="Close">✕</button>
      </div>
      <div class="ps-panel-body">
        <p style="font-size:0.88rem;color:var(--text-secondary);margin-bottom:1.25rem;line-height:1.6;">
          Learn about essential vitamins, minerals, and nutrients your body needs. Tap any item to expand and learn about its functions, deficiency symptoms, and natural food sources.
        </p>
        <div class="ps-vitamin-list">
          ${VITAMINS_DATA.map((v, i) => `
            <div class="ps-vitamin-item" data-vitamin="${i}">
              <div class="ps-vitamin-header">
                <div class="ps-vitamin-header-left">
                  <div class="ps-vitamin-badge" style="background:${v.color}">${v.badge}</div>
                  <div>
                    <div class="ps-vitamin-name">${v.name}</div>
                    <div class="ps-vitamin-subtitle">${v.subtitle}</div>
                  </div>
                </div>
                <i data-lucide="chevron-down" class="ps-vitamin-chevron"></i>
              </div>
              <div class="ps-vitamin-body">
                <div class="ps-vitamin-section">
                  <div class="ps-vitamin-section-title">Functions</div>
                  <p>${v.functions}</p>
                </div>
                <div class="ps-vitamin-section">
                  <div class="ps-vitamin-section-title">Deficiency Symptoms</div>
                  <p>${v.deficiency}</p>
                </div>
                <div class="ps-vitamin-section">
                  <div class="ps-vitamin-section-title">Best Natural Sources</div>
                  <div class="ps-vitamin-sources">
                    ${v.sources.map(s => `<span class="ps-vitamin-source-tag">${s}</span>`).join('')}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(panel);

    // Accordion toggle
    panel.querySelectorAll('.ps-vitamin-header').forEach(header => {
      header.addEventListener('click', () => {
        const item = header.closest('.ps-vitamin-item');
        const wasOpen = item.classList.contains('ps-vitamin-open');
        // Close all
        panel.querySelectorAll('.ps-vitamin-item').forEach(v => v.classList.remove('ps-vitamin-open'));
        // Open clicked (toggle)
        if (!wasOpen) item.classList.add('ps-vitamin-open');
      });
    });
  }

  // ==========================================
  // INJECT SMART SUGGESTIONS (into result screen)
  // ==========================================
  function injectSmartSuggestions() {
    const resultScreen = document.getElementById('resultScreen');
    if (!resultScreen) return;

    const container = document.createElement('div');
    container.className = 'ps-smart-suggestions';
    container.id = 'psSmartSuggestions';
    container.innerHTML = `
      <div class="ps-smart-badge" id="psSmartBadge"><i data-lucide="sparkles"></i> AI Smart Suggestions</div>
      <div id="psSmartContent"></div>
    `;

    // Insert before the buttons
    const btnViewReport = document.getElementById('btnViewReport');
    if (btnViewReport) {
      btnViewReport.parentNode.insertBefore(container, btnViewReport);
    }
  }

  // ==========================================
  // NAVIGATION EVENTS
  // ==========================================
  function bindNavEvents() {
    const navItems = document.querySelectorAll('.ps-nav-item');
    const panels = {
      chat: document.getElementById('psChatPanel'),
      weight: document.getElementById('psWeightPanel'),
      fitness: document.getElementById('psFitnessPanel'),
      nutrition: document.getElementById('psNutritionPanel'),
      scan: document.getElementById('psScanPanel'),
      bmi: document.getElementById('psBmiPanel'),
      profile: document.getElementById('psProfilePanel')
    };

    // Close buttons
    document.querySelectorAll('.ps-panel-close').forEach(btn => {
      btn.addEventListener('click', () => {
        closeAllPanels(panels);
        setActiveNav('home');
      });
    });

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const panelName = item.getAttribute('data-panel');

        if (panelName === 'home') {
          closeAllPanels(panels);
          setActiveNav('home');
          // Select textTab for script.js
          const tabTextBtn = document.getElementById('tabTextBtn');
          if (tabTextBtn) tabTextBtn.click();
          return;
        }

        const targetPanel = panels[panelName];
        if (!targetPanel) return;

        const isAlreadyOpen = targetPanel.classList.contains('ps-panel-open');

        // Close all first
        closeAllPanels(panels);

        if (!isAlreadyOpen) {
          targetPanel.classList.add('ps-panel-open');
          setActiveNav(panelName);
          if (window.lucide) setTimeout(() => lucide.createIcons(), 50);

          // Focus chat input when opening chat
          if (panelName === 'chat') {
            setTimeout(() => {
              const input = document.getElementById('psChatInput');
              if (input) input.focus();
            }, 400);
          }

          // Trigger scanner when opening scan panel
          if (panelName === 'scan') {
            const tabCameraBtn = document.getElementById('tabCameraBtn');
            if (tabCameraBtn) tabCameraBtn.click();
            setTimeout(() => {
              const btnStart = document.getElementById('btnStartScanner');
              if (btnStart && btnStart.style.display !== 'none') {
                btnStart.click();
              }
            }, 100);
          }

          // Trigger gauge render when opening BMI panel
          if (panelName === 'bmi') {
            setTimeout(() => {
              const weight = parseFloat(document.getElementById('psBmiWeight').value);
              const height = parseFloat(document.getElementById('psBmiHeight').value);
              if (weight && height) {
                const heightM = height / 100;
                const bmi = weight / (heightM * heightM);
                if (typeof drawBmiGauge === 'function') drawBmiGauge(bmi);
              } else {
                if (typeof drawBmiGauge === 'function') drawBmiGauge(10);
              }
            }, 300);
          }
        } else {
          setActiveNav('home');
        }
      });
    });

    // Profile menu items click bindings
    const profLanguage = document.getElementById('profLanguage');
    if (profLanguage) {
      profLanguage.addEventListener('click', () => {
        if (typeof showLanguageModal === 'function') showLanguageModal();
      });
    }

    const profSettings = document.getElementById('profSettings');
    if (profSettings) {
      profSettings.addEventListener('click', () => {
        const settingsToggle = document.getElementById('settingsToggle');
        if (settingsToggle) settingsToggle.click();
      });
    }

    const profAbout = document.getElementById('profAbout');
    if (profAbout) {
      profAbout.addEventListener('click', () => {
        if (typeof showAbout === 'function') showAbout();
      });
    }

    const profPersonal = document.getElementById('profPersonal');
    if (profPersonal) {
      profPersonal.addEventListener('click', () => {
        if (typeof window.showProfileEditModal === 'function') {
          window.showProfileEditModal('editName');
        }
      });
    }
    const profGoals = document.getElementById('profGoals');
    if (profGoals) {
      profGoals.addEventListener('click', () => {
        if (typeof window.showProfileEditModal === 'function') {
          window.showProfileEditModal('editGoal');
        }
      });
    }
    const profActivity = document.getElementById('profActivity');
    if (profActivity) {
      profActivity.addEventListener('click', () => {
        if (typeof window.showProfileEditModal === 'function') {
          window.showProfileEditModal('editActivity');
        }
      });
    }
    const profileCard = document.querySelector('#psProfilePanel .profile-card');
    if (profileCard) {
      profileCard.addEventListener('click', () => {
        if (typeof window.showProfileEditModal === 'function') {
          window.showProfileEditModal('editName');
        }
      });
    }
    const profHelp = document.getElementById('profHelp');
    if (profHelp) {
      profHelp.addEventListener('click', () => {
        alert('Help & Support: For support, contact founders: sundramgoud@gmail.com.');
      });
    }
  }

  function closeAllPanels(panels) {
    Object.values(panels).forEach(p => {
      if (p) p.classList.remove('ps-panel-open');
    });
  }

  function setActiveNav(name) {
    document.querySelectorAll('.ps-nav-item').forEach(item => {
      item.classList.toggle('ps-nav-active', item.getAttribute('data-panel') === name);
    });
  }

  // ==========================================
  // AI CHAT LOGIC
  // ==========================================
  let chatIsSending = false;
  let currentChatBarcode = null;

  function openChatBarcodeModal() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'ps-barcode-modal-overlay';
    overlay.id = 'psChatBarcodeModalOverlay';
    overlay.innerHTML = `
      <div class="ps-barcode-modal">
        <button class="ps-barcode-modal-close" id="psChatBarcodeModalClose"><i data-lucide="x"></i></button>
        <h3><i data-lucide="scan-line"></i> Scan Barcode</h3>
        <div class="ps-barcode-modal-scanner" id="psChatBarcodeScanner"></div>
        <div class="barcode-upload-divider"><span>or</span></div>
        <div class="ps-barcode-modal-upload">
          <button class="btn-scanner-action btn-upload-barcode" id="psChatBarcodeUploadBtn" style="width:100%">
            <i data-lucide="image"></i>
            <span>Upload Barcode Image</span>
          </button>
          <input type="file" id="psChatBarcodeFileInput" accept="image/*" hidden>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    if (window.lucide) lucide.createIcons();

    // Start scanner in the modal
    if (!window.isSecureContext) {
      console.warn('[Chat Barcode] Camera access requires HTTPS');
      document.getElementById('psChatBarcodeScanner').innerHTML = '<p style="color:white; padding: 20px; text-align: center; display: flex; align-items: center; justify-content: center; height: 100%;">Camera requires a secure HTTPS connection. Please use the Upload button below.</p>';
    } else {
      Html5Qrcode.getCameras().then(devices => {
        if (devices && devices.length > 0) {
          let selectedCameraId = devices[0].id;
          for (const device of devices) {
            const label = device.label.toLowerCase();
            if (label.includes('back') || label.includes('rear') || label.includes('environment') || label.includes('0')) {
              selectedCameraId = device.id;
              if (label.includes('back')) break;
            }
          }

          const chatScanner = new Html5Qrcode('psChatBarcodeScanner', {
            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.QR_CODE
            ],
            verbose: false
          });

          chatScanner.start(
            { deviceId: { exact: selectedCameraId } },
          {
            fps: 10,
            qrbox: function(viewfinderWidth, viewfinderHeight) {
              let minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              let qrboxWidth = Math.floor(minEdge * 0.85);
              let qrboxHeight = Math.floor(qrboxWidth * 0.45);
              return { width: Math.max(qrboxWidth, 200), height: Math.max(qrboxHeight, 80) };
            },
            aspectRatio: 1.0,
            disableFlip: false
          },
          (decodedText) => {
            setChatBarcode(decodedText);
            closeChatBarcodeModal(chatScanner, overlay);
          },
          () => {}
        ).catch(err => {
          console.warn('[Chat Barcode] Camera failed to start:', err.message);
        });

        // Store chatScanner so close button can clear it
        window._currentChatScanner = chatScanner;
      } else {
        document.getElementById('psChatBarcodeScanner').innerHTML = '<p style="color:white; padding: 20px; text-align: center; display: flex; align-items: center; justify-content: center; height: 100%;">No camera found on this device. Please use the Upload button below.</p>';
      }
    }).catch(err => {
      console.warn('[Chat Barcode] Camera permission denied, upload only:', err.message);
      document.getElementById('psChatBarcodeScanner').innerHTML = '<p style="color:white; padding: 20px; text-align: center; display: flex; align-items: center; justify-content: center; height: 100%;">Camera permission denied. Please allow access or use the Upload button below.</p>';
    });
    }

    // Upload button
    const uploadBtn = document.getElementById('psChatBarcodeUploadBtn');
    const fileInput = document.getElementById('psChatBarcodeFileInput');
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        let tempDiv = document.getElementById('tempChatBarcodeScanner');
        if (!tempDiv) {
          tempDiv = document.createElement('div');
          tempDiv.id = 'tempChatBarcodeScanner';
          tempDiv.style.display = 'none';
          document.body.appendChild(tempDiv);
        }
        const tempScanner = new Html5Qrcode('tempChatBarcodeScanner', {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.QR_CODE
          ],
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          },
          verbose: false
        });
        const result = await tempScanner.scanFile(file, true);
        setChatBarcode(result);
        await tempScanner.clear();
        closeChatBarcodeModal(window._currentChatScanner, overlay);
      } catch (err) {
        alert(mt('alert_barcode_fail'));
      }
    });

    // Close button
    document.getElementById('psChatBarcodeModalClose').addEventListener('click', () => {
      closeChatBarcodeModal(window._currentChatScanner, overlay);
    });

    // Click overlay to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeChatBarcodeModal(window._currentChatScanner, overlay);
    });
  }

  async function closeChatBarcodeModal(scanner, overlay) {
    try {
      if (scanner) {
        const state = scanner.getState();
        if (state === Html5QrcodeScannerState.SCANNING) {
          await scanner.stop();
        }
        await scanner.clear();
      }
    } catch (e) {}
    window._currentChatScanner = null;
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  function setChatBarcode(barcode) {
    currentChatBarcode = barcode;
    const preview = document.getElementById('psChatBarcodePreview');
    const text = document.getElementById('psChatBarcodeText');
    if (preview && text) {
      text.textContent = barcode;
      preview.classList.add('ps-visible');
    }
    if (navigator.vibrate) navigator.vibrate(100);
    if (window.lucide) lucide.createIcons();
  }

  function clearChatBarcode() {
    currentChatBarcode = null;
    const preview = document.getElementById('psChatBarcodePreview');
    if (preview) preview.classList.remove('ps-visible');
  }

  function sendChatMessage() {
    const input = document.getElementById('psChatInput');
    const message = input.value.trim();
    
    // Allow sending if there is a message OR a barcode
    if ((!message && !currentChatBarcode) || chatIsSending) return;

    input.value = '';
    chatIsSending = true;

    const sentBarcode = currentChatBarcode;
    clearChatBarcode();

    // Build the actual query to send
    let queryMessage = message;
    if (sentBarcode) {
      const barcodeQuery = `${sentBarcode} food product ingredients nutrition brand details India`;
      queryMessage = message 
        ? `Barcode: ${sentBarcode} - ${message}. Search context: ${barcodeQuery}`
        : `Analyze this barcode product: ${barcodeQuery}. Provide product name, health analysis, ingredients breakdown, health score (0-10), and healthier alternatives.`;
    }

    // Add user message (display original message + barcode badge)
    addChatMessage('user', message, sentBarcode);

    // Hide suggestions
    const suggestions = document.getElementById('psChatSuggestions');
    if (suggestions) suggestions.style.display = 'none';

    // Show typing indicator
    const typing = showTypingIndicator();

    // Call API
    fetchChatResponse(queryMessage)
      .then(response => {
        removeTypingIndicator(typing);
        addChatMessage('ai', response);
        saveChatHistory();
      })
      .catch(err => {
        removeTypingIndicator(typing);
        addChatMessage('ai', 'Sorry, I couldn\'t process your request right now. Please try again. Error: ' + err.message);
      })
      .finally(() => {
        chatIsSending = false;
      });
  }

  function addChatMessage(type, content, barcodeValue = null) {
    const messagesContainer = document.getElementById('psChatMessages');
    const msg = document.createElement('div');
    msg.className = `ps-chat-msg ps-msg-${type === 'user' ? 'user' : 'ai'}`;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let barcodeHtml = '';
    if (barcodeValue) {
      barcodeHtml = `<div class="ps-chat-barcode-preview ps-visible" style="margin:0 0 0.5rem;"><i data-lucide="scan-line" class="barcode-icon"></i><span class="barcode-text">${escapeHTML(barcodeValue)}</span></div>`;
    }

    if (type === 'user') {
      msg.innerHTML = `
        <div class="ps-msg-avatar">U</div>
        <div class="ps-msg-content">
          ${barcodeHtml}
          ${content ? `<p>${escapeHTML(content)}</p>` : ''}
          <span class="ps-msg-time">${time}</span>
        </div>
      `;
    } else {
      msg.innerHTML = `
        <div class="ps-msg-avatar"><i data-lucide="bot"></i></div>
        <div class="ps-msg-content">
          ${formatAIResponse(content)}
          <span class="ps-msg-time">${time}</span>
        </div>
      `;
    }

    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    if (window.lucide) setTimeout(() => lucide.createIcons(), 50);
  }

  function addAIWelcomeMessage() {
    const messagesContainer = document.getElementById('psChatMessages');
    const msg = document.createElement('div');
    msg.className = 'ps-chat-msg ps-msg-ai';
    msg.innerHTML = `
      <div class="ps-msg-avatar"><i data-lucide="bot"></i></div>
      <div class="ps-msg-content">
        <p>${mt('chat_w1')}</p>
        <p>${mt('chat_w2')}</p>
        <ul>
          <li>${mt('chat_w3')}</li>
          <li>${mt('chat_w4')}</li>
          <li>${mt('chat_w5')}</li>
          <li>${mt('chat_w6')}</li>
          <li>${mt('chat_w7')}</li>
        </ul>
        <p>${mt('chat_w8')}</p>
      </div>
    `;
    messagesContainer.appendChild(msg);
  }

  function showTypingIndicator() {
    const messagesContainer = document.getElementById('psChatMessages');
    const typing = document.createElement('div');
    typing.className = 'ps-chat-msg ps-msg-ai';
    typing.id = 'psTypingIndicator';
    typing.innerHTML = `
      <div class="ps-msg-avatar"><i data-lucide="bot"></i></div>
      <div class="ps-typing">
        <div class="ps-typing-dot"></div>
        <div class="ps-typing-dot"></div>
        <div class="ps-typing-dot"></div>
      </div>
    `;
    messagesContainer.appendChild(typing);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    if (window.lucide) lucide.createIcons();
    return typing;
  }

  function removeTypingIndicator(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  async function fetchChatResponse(message) {
    try {
      // Language code → English name map for AI prompt injection
      const LANG_CODE_TO_AI_NAME = {
        'en': 'English',
        'hi': 'Hindi',
        'hinglish': 'Hinglish',
        'mr': 'Marathi',
        'gu': 'Gujarati',
        'ta': 'Tamil',
        'te': 'Telugu',
        'bn': 'Bengali',
        'kn': 'Kannada',
        'ml': 'Malayalam',
        'pa': 'Punjabi'
      };

      // Safely access global AppState if it exists
      const langCode = (typeof AppState !== 'undefined' && AppState.currentLang) ? AppState.currentLang : 'en';
      const targetLanguage = LANG_CODE_TO_AI_NAME[langCode] || 'English';
      
      const payload = {
        message: message,
        context: getRecentChatContext(),
        targetLanguage: targetLanguage
      };

      const response = await fetch('/.netlify/functions/health-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        // If server returned a fallback reply, use it
        if (errData.reply) return errData.reply;
        throw new Error(`Server error ${response.status}`);
      }

      const data = await response.json();
      return data.reply || 'I couldn\'t generate a response. Please try again.';
    } catch (err) {
      throw err;
    }
  }

  function getRecentChatContext() {
    const msgs = document.querySelectorAll('#psChatMessages .ps-chat-msg');
    const recent = [];
    const allMsgs = Array.from(msgs).slice(-6); // Last 6 messages for context
    allMsgs.forEach(msg => {
      const isUser = msg.classList.contains('ps-msg-user');
      const content = msg.querySelector('.ps-msg-content')?.textContent?.trim() || '';
      if (content) {
        recent.push({ role: isUser ? 'user' : 'assistant', content: content.substring(0, 300) });
      }
    });
    return recent;
  }

  function formatAIResponse(text) {
    // Convert markdown-like formatting to HTML
    let html = text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^[-•] (.+)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)/gm, '<li>$2</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // Wrap lists
    html = html.replace(/((?:<li>.+?<\/li>\s*)+)/g, '<ul>$1</ul>');

    // Wrap in paragraphs
    if (!html.startsWith('<')) html = '<p>' + html + '</p>';
    if (!html.endsWith('>')) html += '</p>';

    return html;
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==========================================
  // CHAT HISTORY (localStorage)
  // ==========================================
  function saveChatHistory() {
    const msgs = document.querySelectorAll('#psChatMessages .ps-chat-msg');
    const history = [];
    msgs.forEach(msg => {
      const isUser = msg.classList.contains('ps-msg-user');
      const content = msg.querySelector('.ps-msg-content')?.innerHTML || '';
      const time = msg.querySelector('.ps-msg-time')?.textContent || '';
      history.push({ type: isUser ? 'user' : 'ai', content, time });
    });
    // Keep last 50 messages
    const trimmed = history.slice(-50);
    try {
      localStorage.setItem(PS_CHAT_HISTORY_KEY, JSON.stringify(trimmed));
    } catch (e) {
      // localStorage full — clear old data
      localStorage.removeItem(PS_CHAT_HISTORY_KEY);
    }
  }

  function initChatFromHistory() {
    try {
      const saved = JSON.parse(localStorage.getItem(PS_CHAT_HISTORY_KEY));
      if (!saved || saved.length === 0) return;

      const messagesContainer = document.getElementById('psChatMessages');
      messagesContainer.innerHTML = ''; // Clear welcome message

      saved.forEach(item => {
        const msg = document.createElement('div');
        msg.className = `ps-chat-msg ps-msg-${item.type === 'user' ? 'user' : 'ai'}`;

        if (item.type === 'user') {
          msg.innerHTML = `
            <div class="ps-msg-avatar">U</div>
            <div class="ps-msg-content">${item.content}</div>
          `;
        } else {
          msg.innerHTML = `
            <div class="ps-msg-avatar"><i data-lucide="bot"></i></div>
            <div class="ps-msg-content">${item.content}</div>
          `;
        }
        messagesContainer.appendChild(msg);
      });

      // Hide suggestions if there's history
      const suggestions = document.getElementById('psChatSuggestions');
      if (suggestions && saved.length > 2) suggestions.style.display = 'none';

    } catch (e) {
      // Invalid data — ignore
    }
  }

  // ==========================================
  // DAILY TIP ROTATION
  // ==========================================
  function initDailyTip() {
    let tipIndex = 0;
    try {
      const saved = localStorage.getItem(PS_DAILY_TIP_KEY);
      if (saved !== null) tipIndex = parseInt(saved) || 0;
    } catch (e) {}

    const container = document.getElementById('psDailyTipContent');
    if (!container) return;

    // Pre-render ALL tips into the DOM (hidden) so the translation system can capture them
    container.innerHTML = DAILY_TIPS.map((tip, i) => `
      <div class="ps-daily-tip-content" id="psTipContent_${i}" style="display: ${i === tipIndex ? 'block' : 'none'};">
        <div style="display:flex; gap:0.75rem; align-items:flex-start; margin-bottom:0.75rem;">
          <div style="font-size:2rem; line-height:1;">${tip.emoji}</div>
          <div>
            <h4 style="margin:0 0 0.25rem 0; font-size:0.9rem;">${tip.title}</h4>
            <p style="margin:0; font-size:0.8rem; color:var(--text-secondary); line-height:1.5;">${tip.text}</p>
          </div>
        </div>
      </div>
    `).join('');

    renderDailyTip(tipIndex);

    // Dots click
    document.querySelectorAll('.ps-tip-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-tip'));
        renderDailyTip(idx);
      });
    });

    // Auto-rotate every 8 seconds
    setInterval(() => {
      tipIndex = (tipIndex + 1) % DAILY_TIPS.length;
      renderDailyTip(tipIndex);
    }, 8000);
  }

  function renderDailyTip(index) {
    if (!DAILY_TIPS[index]) return;

    // Toggle visibility of pre-rendered tips instead of re-rendering HTML
    for (let i = 0; i < DAILY_TIPS.length; i++) {
        const el = document.getElementById('psTipContent_' + i);
        if (el) el.style.display = i === index ? 'block' : 'none';
    }

    // Update dots
    document.querySelectorAll('.ps-tip-dot').forEach((dot, i) => {
      dot.classList.toggle('ps-tip-dot-active', i === index);
    });

    try {
      localStorage.setItem(PS_DAILY_TIP_KEY, index.toString());
    } catch (e) {}
  }

  // ==========================================
  // BMI CALCULATOR
  // ==========================================
  function initBMI() {
    const calcBtn = document.getElementById('psBmiCalc');
    if (!calcBtn) return;

    // Load saved BMI
    try {
      const saved = JSON.parse(localStorage.getItem(PS_BMI_KEY));
      if (saved) {
        document.getElementById('psBmiWeight').value = saved.weight;
        document.getElementById('psBmiHeight').value = saved.height;
        calculateBMI(saved.weight, saved.height, false);
      }
    } catch (e) {}

    calcBtn.addEventListener('click', () => {
      const weight = parseFloat(document.getElementById('psBmiWeight').value);
      const height = parseFloat(document.getElementById('psBmiHeight').value);

      if (!weight || !height || weight <= 0 || height <= 0) {
        alert(mt('alert_bmi_invalid'));
        return;
      }

      calculateBMI(weight, height, true);

      try {
        localStorage.setItem(PS_BMI_KEY, JSON.stringify({ weight, height }));
      } catch (e) {}
    });

    // Theme toggle re-draw hook
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        setTimeout(() => {
          const weight = parseFloat(document.getElementById('psBmiWeight').value);
          const height = parseFloat(document.getElementById('psBmiHeight').value);
          if (weight && height) {
            const heightM = height / 100;
            const bmi = weight / (heightM * heightM);
            drawBmiGauge(bmi);
          } else {
            drawBmiGauge(10);
          }
        }, 150);
      });
    }
  }

  function drawBmiGauge(value) {
    const canvas = document.getElementById("psBmiGauge");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cx = 200;
    const cy = 210;
    const radius = 130;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dynamic color coding based on theme
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const textColor = isDark ? '#ffffff' : '#1e293b';
    const subtextColor = isDark ? '#94a3b8' : '#64748b';
    const tickColor = isDark ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,.2)';
    const needleColor = isDark ? '#ffffff' : '#0f172a';
    const pinColor = isDark ? '#ffffff' : '#0f172a';

    // BMI Gauge Sections (adapted to swap Sector 1 & 2 for scientific correctness using exact same colors)
    const sections = [
      ["#eab308", 180, 225], // Underweight (Yellow)
      ["#22c55e", 225, 270], // Normal (Green)
      ["#f97316", 270, 315], // Overweight (Orange)
      ["#ef4444", 315, 360]  // Obese (Red)
    ];

    sections.forEach(s => {
      ctx.beginPath();
      ctx.lineWidth = 24;
      ctx.strokeStyle = s[0];
      ctx.arc(
        cx,
        cy,
        radius,
        s[1] * Math.PI / 180,
        s[2] * Math.PI / 180
      );
      ctx.stroke();
    });

    // Draw ticks
    for (let i = 0; i <= 30; i++) {
      const angle = Math.PI + (i / 30) * Math.PI;

      const x1 = cx + (radius - 18) * Math.cos(angle);
      const y1 = cy + (radius - 18) * Math.sin(angle);

      const x2 = cx + (radius + 4) * Math.cos(angle);
      const y2 = cy + (radius + 4) * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = tickColor;
      ctx.stroke();
    }

    const min = 10;
    const max = 40;

    let percent = (value - min) / (max - min);
    percent = Math.max(0, Math.min(1, percent));

    const angle = Math.PI + (percent * Math.PI);

    const nx = cx + 100 * Math.cos(angle);
    const ny = cy + 100 * Math.sin(angle);

    // Draw needle
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.strokeStyle = needleColor;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.stroke();

    // Draw central pin
    ctx.beginPath();
    ctx.fillStyle = pinColor;
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();

    // Draw text values
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";

    ctx.font = "bold 20px Arial";
    ctx.fillText("BMI", cx, 95);

    ctx.font = "bold 42px Arial";
    ctx.fillText(value.toFixed(1), cx, 140);

    ctx.font = "16px Arial";
    ctx.fillStyle = subtextColor;
    ctx.fillText("Body Mass Index", cx, 165);
  }

  function animateBmiNeedle(target, onComplete) {
    const min = 10;
    const max = 40;

    target = Math.max(min, Math.min(max, target));

    const duration = 2000; // Smoother 2.0s duration
    const start = performance.now();

    function frame(now) {
      let p = (now - start) / duration;
      if (p > 1) p = 1;

      let val;
      if (p < 0.5) {
        val = min + (max - min) * (p / 0.5);
      } else {
        val = max - (max - target) * ((p - 0.5) / 0.5);
      }

      drawBmiGauge(val);

      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        if (typeof onComplete === 'function') onComplete();
      }
    }

    requestAnimationFrame(frame);
  }

  async function fetchBmiSuggestions(bmi, category, height, weight) {
    const suggestionsCard = document.getElementById('psBmiAiSuggestions');
    const suggestionsContent = document.getElementById('psBmiAiContent');
    
    if (!suggestionsCard || !suggestionsContent) return;
    
    suggestionsCard.style.display = 'block';
    suggestionsContent.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; padding: 10px 0;">
        <div class="ps-typing" style="display: flex; gap: 4px;">
          <div class="ps-typing-dot" style="width: 6px; height: 6px; background: #0ea5e9; border-radius: 50%; animation: psTyping 1.4s infinite both;"></div>
          <div class="ps-typing-dot" style="width: 6px; height: 6px; background: #0ea5e9; border-radius: 50%; animation: psTyping 1.4s infinite both; animation-delay: 0.2s;"></div>
          <div class="ps-typing-dot" style="width: 6px; height: 6px; background: #0ea5e9; border-radius: 50%; animation: psTyping 1.4s infinite both; animation-delay: 0.4s;"></div>
        </div>
        <span style="font-style: italic; color: var(--text-muted);">Consulting AI Nutritionist...</span>
      </div>
    `;

    try {
      const langCode = (typeof AppState !== 'undefined' && AppState.currentLang) ? AppState.currentLang : 'en';
      const LANG_CODE_TO_AI_NAME = {
        'en': 'English',
        'hi': 'Hindi',
        'hinglish': 'Hinglish',
        'mr': 'Marathi',
        'gu': 'Gujarati',
        'ta': 'Tamil',
        'te': 'Telugu',
        'bn': 'Bengali',
        'kn': 'Kannada',
        'ml': 'Malayalam',
        'pa': 'Punjabi'
      };
      const targetLanguage = LANG_CODE_TO_AI_NAME[langCode] || 'English';

      const prompt = `My BMI is ${bmi.toFixed(1)} which is categorized as "${category}". My height is ${height} cm and weight is ${weight} kg. As a professional nutritionist, please suggest what I should eat, what to avoid, and how to maintain/reach a healthy BMI. Provide practical, actionable dietary tips in simple bullet points.`;
      
      const payload = {
        message: prompt,
        context: [],
        targetLanguage: targetLanguage
      };

      const response = await fetch('/.netlify/functions/health-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || 'Could not fetch suggestions.';
      
      suggestionsContent.innerHTML = formatAIResponse(reply);
      
    } catch (err) {
      console.error('[BMI AI] Error fetching suggestions:', err);
      suggestionsContent.innerHTML = `<span style="color: #ef4444;">Failed to load AI suggestions. Please try again.</span>`;
    }
  }

  function calculateBMI(weight, height, animate = true) {
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    const bmiRounded = bmi.toFixed(1);

    let category, desc, color;
    if (bmi < 18.5) {
      category = mt('bmi_uw');
      desc = mt('bmi_uw_desc');
      color = '#f59e0b';
    } else if (bmi < 25) {
      category = mt('bmi_nw');
      desc = mt('bmi_nw_desc');
      color = '#10b981';
    } else if (bmi < 30) {
      category = mt('bmi_ow');
      desc = mt('bmi_ow_desc');
      color = '#f59e0b';
    } else {
      category = mt('bmi_ob');
      desc = mt('bmi_ob_desc');
      color = '#ef4444';
    }

    document.getElementById('psBmiValue').textContent = bmiRounded;
    document.getElementById('psBmiValue').style.color = color;
    document.getElementById('psBmiCategory').textContent = category;
    document.getElementById('psBmiCategory').style.color = color;
    document.getElementById('psBmiDesc').textContent = desc;

    // Position marker on bar (BMI 15-40 range)
    const percent = Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100));
    document.getElementById('psBmiMarker').style.left = `${percent}%`;

    const result = document.getElementById('psBmiResult');
    result.classList.add('ps-bmi-visible');

    const suggestionsCard = document.getElementById('psBmiAiSuggestions');
    if (suggestionsCard) suggestionsCard.style.display = 'none';

    if (animate) {
      animateBmiNeedle(bmi, () => {
        fetchBmiSuggestions(bmi, category, height, weight);
      });
    } else {
      drawBmiGauge(bmi);
      fetchBmiSuggestions(bmi, category, height, weight);
    }
  }

  // ==========================================
  // SMART SUGGESTIONS ENGINE (post-scan)
  // ==========================================
  function hookIntoScanResults() {
    // Override the navigateTo function to detect when result screen shows
    const originalNavigateTo = window.navigateTo;

    // We can't override directly since it's module-scoped.
    // Instead, observe DOM changes on result screen
    const resultScreen = document.getElementById('resultScreen');
    if (!resultScreen) return;

    const observer = new MutationObserver(() => {
      if (resultScreen.classList.contains('active')) {
        generateSmartSuggestions();
      }
    });

    observer.observe(resultScreen, { attributes: true, attributeFilter: ['class'] });
  }

  function generateSmartSuggestions() {
    const container = document.getElementById('psSmartSuggestions');
    const content = document.getElementById('psSmartContent');
    const badge = document.getElementById('psSmartBadge');
    if (!container || !content) return;

    // Get current language
    const lang = (typeof AppState !== 'undefined' && AppState.currentLang) ? AppState.currentLang : 'en';

    // Multilingual Smart Suggestions strings
    const S = {
      en: {
        badge: 'AI Smart Suggestions',
        highSugar: '<strong>High Sugar Alert!</strong> Look for sugar-free or naturally sweetened alternatives. Try fresh fruits instead of sugary snacks.',
        replaceDrinks: 'Replace sugary drinks with <strong>infused water, coconut water, or buttermilk</strong>.',
        ultraProcessed: '<strong>Ultra-processed!</strong> Try to replace with homemade versions. Cook at home using whole, fresh ingredients.',
        manyAdditives: '<strong>Many additives detected.</strong> Look for products with shorter ingredient lists and no E-numbers.',
        avoidProduct: '<strong>Consider avoiding this product.</strong> There are healthier options available. Check the Alternatives section in the full report.',
        askAI: 'Ask our <strong>AI Health Assistant</strong> for better alternatives — tap the Chat tab below!',
        useModeration: '<strong>Use in moderation.</strong> This product is not the worst, but there are better options. Balance it with nutrition-rich meals.',
        goodChoice: '<strong>Good choice!</strong> This product is relatively healthy. Just watch your portions and maintain a balanced diet.',
        trackCalories: 'Track your daily calorie and nutrient intake. Use the <strong>Weight Management</strong> tab for personalized tips.'
      },
      hi: {
        badge: 'एआई स्मार्ट सुझाव',
        highSugar: '<strong>हाई शुगर अलर्ट!</strong> शुगर-फ्री या प्राकृतिक रूप से मीठे विकल्प खोजें। मीठे स्नैक्स की जगह ताजे फल खाएं।',
        replaceDrinks: 'मीठे पेय को <strong>इन्फ्यूज्ड पानी, नारियल पानी, या छाछ</strong> से बदलें।',
        ultraProcessed: '<strong>अल्ट्रा-प्रोसेस्ड!</strong> घर पर बने विकल्पों से बदलने की कोशिश करें। ताज़ी सामग्री से घर पर खाना बनाएं।',
        manyAdditives: '<strong>कई एडिटिव्स पाए गए।</strong> छोटी सामग्री सूची और बिना E-नंबर वाले उत्पाद चुनें।',
        avoidProduct: '<strong>इस उत्पाद से बचने पर विचार करें।</strong> स्वस्थ विकल्प उपलब्ध हैं। पूरी रिपोर्ट में विकल्प देखें।',
        askAI: 'बेहतर विकल्पों के लिए हमारे <strong>एआई हेल्थ असिस्टेंट</strong> से पूछें — नीचे चैट टैब पर टैप करें!',
        useModeration: '<strong>सीमित मात्रा में उपयोग करें।</strong> यह सबसे खराब नहीं है, लेकिन बेहतर विकल्प हैं।',
        goodChoice: '<strong>अच्छा विकल्प!</strong> यह उत्पाद अपेक्षाकृत स्वस्थ है। बस अपनी मात्रा पर ध्यान दें।',
        trackCalories: 'अपनी दैनिक कैलोरी ट्रैक करें। व्यक्तिगत सुझावों के लिए <strong>वेट मैनेजमेंट</strong> टैब का उपयोग करें।'
      },
      hinglish: {
        badge: 'AI Smart Suggestions',
        highSugar: '<strong>High Sugar Alert!</strong> Sugar-free ya naturally sweetened alternatives dhundho. Sugary snacks ki jagah fresh fruits khao.',
        replaceDrinks: 'Sugary drinks ko <strong>infused water, nariyal pani, ya chaas</strong> se replace karo.',
        ultraProcessed: '<strong>Ultra-processed!</strong> Ghar pe bane alternatives se replace karo. Fresh ingredients se ghar pe khana banao.',
        manyAdditives: '<strong>Bahut saare additives detected.</strong> Chhoti ingredient list aur bina E-numbers wale products chuno.',
        avoidProduct: '<strong>Is product se bachne ka sochna chahiye.</strong> Healthy options available hain. Poori report mein alternatives dekho.',
        askAI: 'Better alternatives ke liye hamare <strong>AI Health Assistant</strong> se pucho — neeche Chat tab pe tap karo!',
        useModeration: '<strong>Limited quantity mein use karo.</strong> Ye sabse kharab nahi hai lekin better options hain.',
        goodChoice: '<strong>Accha choice!</strong> Ye product kaafi healthy hai. Bas apni quantity ka dhyan rakho.',
        trackCalories: 'Daily calorie aur nutrients track karo. <strong>Weight Management</strong> tab pe personalized tips lo.'
      },
      mr: {
        badge: 'एआय स्मार्ट सूचना',
        highSugar: '<strong>हाय शुगर अलर्ट!</strong> साखर-मुक्त किंवा नैसर्गिक पर्याय शोधा. गोड पदार्थांऐवजी ताजी फळे खा.',
        replaceDrinks: 'गोड पेयांना <strong>इन्फ्यूज्ड पाणी, नारळ पाणी किंवा ताक</strong> ने बदला.',
        ultraProcessed: '<strong>अल्ट्रा-प्रोसेस्ड!</strong> घरी बनवलेल्या पर्यायांनी बदला. ताज्या घटकांनी घरी स्वयंपाक करा.',
        manyAdditives: '<strong>अनेक अॅडिटिव्ह आढळले.</strong> कमी घटक सूची आणि E-नंबर नसलेली उत्पादने निवडा.',
        avoidProduct: '<strong>हे उत्पादन टाळण्याचा विचार करा.</strong> आरोग्यदायी पर्याय उपलब्ध आहेत.',
        askAI: 'चांगल्या पर्यायांसाठी आमच्या <strong>एआय हेल्थ असिस्टंट</strong>ला विचारा — खाली चॅट टॅब वर टॅप करा!',
        useModeration: '<strong>मर्यादित प्रमाणात वापरा.</strong> हे सर्वात वाईट नाही, पण अधिक चांगले पर्याय आहेत.',
        goodChoice: '<strong>चांगली निवड!</strong> हे उत्पादन तुलनेने आरोग्यदायी आहे. फक्त प्रमाण लक्षात ठेवा.',
        trackCalories: 'दैनिक कॅलरी ट्रॅक करा. <strong>वेट मॅनेजमेंट</strong> टॅब वापरा.'
      },
      gu: {
        badge: 'એઆઈ સ્માર્ટ સૂચનો',
        highSugar: '<strong>હાઈ શુગર એલર્ટ!</strong> શુગર-ફ્રી અથવા કુદરતી રીતે મીઠા વિકલ્પો શોધો.',
        replaceDrinks: 'ખાંડવાળા પીણાંને <strong>ઈન્ફ્યુઝ્ડ પાણી, નાળિયેર પાણી અથવા છાશ</strong>થી બદલો.',
        ultraProcessed: '<strong>અલ્ટ્રા-પ્રોસેસ્ડ!</strong> ઘરે બનાવેલા વિકલ્પોથી બદલવાનો પ્રયાસ કરો.',
        manyAdditives: '<strong>ઘણા એડિટિવ્સ શોધાયા.</strong> ટૂંકી ઘટક સૂચિ અને E-નંબર વગરના ઉત્પાદનો શોધો.',
        avoidProduct: '<strong>આ ઉત્પાદનને ટાળવાનું વિચારો.</strong> તંદુરસ્ત વિકલ્પો ઉપલબ્ધ છે.',
        askAI: 'વધુ સારા વિકલ્પો માટે <strong>AI હેલ્થ આસિસ્ટન્ટ</strong>ને પૂછો — નીચે ચેટ ટેબ ટેપ કરો!',
        useModeration: '<strong>મર્યાદિત માત્રામાં વાપરો.</strong> આ સૌથી ખરાબ નથી, પણ વધુ સારા વિકલ્પો છે.',
        goodChoice: '<strong>સારી પસંદગી!</strong> આ ઉત્પાદન પ્રમાણમાં તંદુરસ્ત છે.',
        trackCalories: 'દૈનિક કેલરી ટ્રેક કરો. <strong>વેઈટ મેનેજમેન્ટ</strong> ટેબનો ઉપયોગ કરો.'
      },
      ta: {
        badge: 'ஏஐ ஸ்மார்ட் பரிந்துரைகள்',
        highSugar: '<strong>அதிக சர்க்கரை எச்சரிக்கை!</strong> சர்க்கரை இல்லாத அல்லது இயற்கையான மாற்றுகளைத் தேடுங்கள்.',
        replaceDrinks: 'சர்க்கரை பானங்களை <strong>இன்ஃபியூஸ்ட் வாட்டர், தேங்காய் நீர் அல்லது மோர்</strong> மூலம் மாற்றுங்கள்.',
        ultraProcessed: '<strong>அல்ட்ரா-பதப்படுத்தப்பட்டது!</strong> வீட்டில் தயாரிக்கப்பட்ட மாற்றுகளை முயற்சிக்கவும்.',
        manyAdditives: '<strong>பல சேர்க்கைகள் கண்டறியப்பட்டன.</strong> குறுகிய பொருட்கள் பட்டியலுடன் உள்ள தயாரிப்புகளைத் தேடுங்கள்.',
        avoidProduct: '<strong>இந்த தயாரிப்பைத் தவிர்க்க பரிசீலிக்கவும்.</strong> ஆரோக்கியமான விருப்பங்கள் உள்ளன.',
        askAI: 'சிறந்த மாற்றுகளுக்கு <strong>AI ஹெல்த் அசிஸ்டன்ட்</strong>-யிடம் கேளுங்கள்!',
        useModeration: '<strong>மிதமாகப் பயன்படுத்துங்கள்.</strong> இது மோசமானது அல்ல, ஆனால் சிறந்த விருப்பங்கள் உள்ளன.',
        goodChoice: '<strong>நல்ல தேர்வு!</strong> இந்த தயாரிப்பு ஒப்பீட்டளவில் ஆரோக்கியமானது.',
        trackCalories: 'தினசரி கலோரிகளைக் கண்காணிக்கவும். <strong>எடை மேலாண்மை</strong> டேப் பயன்படுத்தவும்.'
      },
      te: {
        badge: 'ఏఐ స్మార్ట్ సూచనలు',
        highSugar: '<strong>హై షుగర్ అలర్ట్!</strong> షుగర్-ఫ్రీ లేదా సహజ ప్రత్యామ్నాయాలు చూడండి.',
        replaceDrinks: 'చక్కెర పానీయాలను <strong>ఇన్ఫ్యూజ్డ్ వాటర్, కొబ్బరి నీళ్లు లేదా మజ్జిగ</strong>తో భర్తీ చేయండి.',
        ultraProcessed: '<strong>అల్ట్రా-ప్రాసెస్డ్!</strong> ఇంట్లో తయారు చేసిన ప్రత్యామ్నాయాలతో భర్తీ చేయడానికి ప్రయత్నించండి.',
        manyAdditives: '<strong>చాలా ఎడిటివ్‌లు కనుగొనబడ్డాయి.</strong> తక్కువ పదార్ధాల జాబితా ఉన్న ఉత్పత్తులను చూడండి.',
        avoidProduct: '<strong>ఈ ఉత్పత్తిని నివారించడం పరిగణించండి.</strong> ఆరోగ్యకరమైన ఎంపికలు అందుబాటులో ఉన్నాయి.',
        askAI: 'మెరుగైన ప్రత్యామ్నాయాల కోసం <strong>AI హెల్త్ అసిస్టెంట్</strong>ని అడగండి!',
        useModeration: '<strong>మితంగా వాడండి.</strong> ఇది అత్యంత చెడ్డది కాదు, కానీ మెరుగైన ఎంపికలు ఉన్నాయి.',
        goodChoice: '<strong>మంచి ఎంపిక!</strong> ఈ ఉత్పత్తి సాపేక్షంగా ఆరోగ్యకరమైనది.',
        trackCalories: 'రోజువారీ కేలరీలను ట్రాక్ చేయండి. <strong>వెయిట్ మేనేజ్‌మెంట్</strong> ట్యాబ్ వాడండి.'
      },
      bn: {
        badge: 'এআই স্মার্ট পরামর্শ',
        highSugar: '<strong>হাই সুগার অ্যালার্ট!</strong> চিনি-মুক্ত বা প্রাকৃতিক বিকল্প খুঁজুন।',
        replaceDrinks: 'মিষ্টি পানীয় <strong>ইনফিউজড ওয়াটার, ডাবের পানি বা ঘোল</strong> দিয়ে প্রতিস্থাপন করুন।',
        ultraProcessed: '<strong>আল্ট্রা-প্রসেসড!</strong> ঘরে তৈরি বিকল্প দিয়ে প্রতিস্থাপন করুন।',
        manyAdditives: '<strong>অনেক অ্যাডিটিভ পাওয়া গেছে।</strong> ছোট উপাদান তালিকা সহ পণ্য বেছে নিন।',
        avoidProduct: '<strong>এই পণ্যটি এড়ানোর কথা ভাবুন।</strong> স্বাস্থ্যকর বিকল্প পাওয়া যায়।',
        askAI: 'আরও ভালো বিকল্পের জন্য <strong>AI হেলথ অ্যাসিস্ট্যান্ট</strong>কে জিজ্ঞাসা করুন!',
        useModeration: '<strong>পরিমিতভাবে ব্যবহার করুন।</strong> এটি সবচেয়ে খারাপ নয়, তবে আরও ভালো বিকল্প আছে।',
        goodChoice: '<strong>ভালো পছন্দ!</strong> এই পণ্যটি তুলনামূলকভাবে স্বাস্থ্যকর।',
        trackCalories: 'দৈনিক ক্যালোরি ট্র্যাক করুন। <strong>ওয়েট ম্যানেজমেন্ট</strong> ট্যাব ব্যবহার করুন।'
      },
      kn: {
        badge: 'ಎಐ ಸ್ಮಾರ್ಟ್ ಸಲಹೆಗಳು',
        highSugar: '<strong>ಹೈ ಶುಗರ್ ಅಲರ್ಟ್!</strong> ಸಕ್ಕರೆ ಮುಕ್ತ ಅಥವಾ ನೈಸರ್ಗಿಕ ಪರ್ಯಾಯಗಳನ್ನು ಹುಡುಕಿ.',
        replaceDrinks: 'ಸಕ್ಕರೆ ಪಾನೀಯಗಳನ್ನು <strong>ಇನ್ಫ್ಯೂಸ್ಡ್ ವಾಟರ್, ತೆಂಗಿನ ನೀರು ಅಥವಾ ಮಜ್ಜಿಗೆ</strong>ಯಿಂದ ಬದಲಾಯಿಸಿ.',
        ultraProcessed: '<strong>ಅಲ್ಟ್ರಾ-ಪ್ರೊಸೆಸ್ಡ್!</strong> ಮನೆಯಲ್ಲಿ ತಯಾರಿಸಿದ ಪರ್ಯಾಯಗಳಿಂದ ಬದಲಾಯಿಸಲು ಪ್ರಯತ್ನಿಸಿ.',
        manyAdditives: '<strong>ಹಲವು ಸೇರ್ಪಡೆಗಳು ಪತ್ತೆಯಾಗಿವೆ.</strong> ಕಡಿಮೆ ಘಟಕ ಪಟ್ಟಿ ಉಳ್ಳ ಉತ್ಪನ್ನಗಳನ್ನು ಆರಿಸಿ.',
        avoidProduct: '<strong>ಈ ಉತ್ಪನ್ನವನ್ನು ತಪ್ಪಿಸುವುದನ್ನು ಪರಿಗಣಿಸಿ.</strong> ಆರೋಗ್ಯಕರ ಆಯ್ಕೆಗಳು ಲಭ್ಯವಿವೆ.',
        askAI: 'ಉತ್ತಮ ಪರ್ಯಾಯಗಳಿಗಾಗಿ <strong>AI ಹೆಲ್ತ್ ಅಸಿಸ್ಟೆಂಟ್</strong> ಅನ್ನು ಕೇಳಿ!',
        useModeration: '<strong>ಮಿತವಾಗಿ ಬಳಸಿ.</strong> ಇದು ಅತ್ಯಂತ ಕೆಟ್ಟದ್ದಲ್ಲ, ಆದರೆ ಉತ್ತಮ ಆಯ್ಕೆಗಳಿವೆ.',
        goodChoice: '<strong>ಒಳ್ಳೆಯ ಆಯ್ಕೆ!</strong> ಈ ಉತ್ಪನ್ನ ತುಲನಾತ್ಮಕವಾಗಿ ಆರೋಗ್ಯಕರ.',
        trackCalories: 'ದೈನಿಕ ಕ್ಯಾಲೋರಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ. <strong>ವೆಯ್ಟ್ ಮ್ಯಾನೇಜ್‌ಮೆಂಟ್</strong> ಟ್ಯಾಬ್ ಬಳಸಿ.'
      },
      ml: {
        badge: 'എഐ സ്മാർട്ട് നിർദ്ദേശങ്ങൾ',
        highSugar: '<strong>ഹൈ ഷുഗർ അലേർട്ട്!</strong> പഞ്ചസാര രഹിത അല്ലെങ്കിൽ പ്രകൃതിദത്ത ബദലുകൾ കണ്ടെത്തുക.',
        replaceDrinks: 'പഞ്ചസാര പാനീയങ്ങൾ <strong>ഇൻഫ്യൂസ്ഡ് വാട്ടർ, കരിക്കിൻ വെള്ളം അല്ലെങ്കിൽ മോര്</strong> ഉപയോഗിച്ച് മാറ്റുക.',
        ultraProcessed: '<strong>അൾട്രാ-പ്രോസസ്ഡ്!</strong> വീട്ടിൽ ഉണ്ടാക്കിയ ബദലുകൾ ഉപയോഗിക്കൂ.',
        manyAdditives: '<strong>നിരവധി അഡിറ്റീവുകൾ കണ്ടെത്തി.</strong> ചെറിയ ഘടക ലിസ്റ്റുള്ള ഉത്പന്നങ്ങൾ തിരഞ്ഞെടുക്കുക.',
        avoidProduct: '<strong>ഈ ഉത്പന്നം ഒഴിവാക്കുന്നത് പരിഗണിക്കുക.</strong> ആരോഗ്യകരമായ ഓപ്ഷനുകൾ ലഭ്യമാണ്.',
        askAI: 'മെച്ചപ്പെട്ട ബദലുകൾക്ക് <strong>AI ഹെൽത്ത് അസിസ്റ്റന്റ്</strong>നോട് ചോദിക്കൂ!',
        useModeration: '<strong>മിതമായി ഉപയോഗിക്കുക.</strong> ഇത് ഏറ്റവും മോശമല്ല, പക്ഷേ മെച്ചപ്പെട്ട ഓപ്ഷനുകൾ ഉണ്ട്.',
        goodChoice: '<strong>നല്ല തിരഞ്ഞെടുപ്പ്!</strong> ഈ ഉത്പന്നം താരതമ്യേന ആരോഗ്യകരമാണ്.',
        trackCalories: 'ദൈനംദിന കലോറി ട്രാക്ക് ചെയ്യുക. <strong>വെയ്റ്റ് മാനേജ്‌മെന്റ്</strong> ടാബ് ഉപയോഗിക്കുക.'
      },
      pa: {
        badge: 'ਏਆਈ ਸਮਾਰਟ ਸੁਝਾਅ',
        highSugar: '<strong>ਹਾਈ ਸ਼ੂਗਰ ਅਲਰਟ!</strong> ਸ਼ੂਗਰ-ਫ੍ਰੀ ਜਾਂ ਕੁਦਰਤੀ ਵਿਕਲਪ ਲੱਭੋ।',
        replaceDrinks: 'ਮਿੱਠੇ ਪੀਣ ਵਾਲੇ ਪਦਾਰਥਾਂ ਨੂੰ <strong>ਇਨਫਿਊਜ਼ਡ ਵਾਟਰ, ਨਾਰੀਅਲ ਪਾਣੀ ਜਾਂ ਲੱਸੀ</strong> ਨਾਲ ਬਦਲੋ।',
        ultraProcessed: '<strong>ਅਲਟ੍ਰਾ-ਪ੍ਰੋਸੈਸਡ!</strong> ਘਰ ਵਿੱਚ ਬਣੇ ਵਿਕਲਪਾਂ ਨਾਲ ਬਦਲੋ।',
        manyAdditives: '<strong>ਬਹੁਤ ਸਾਰੇ ਐਡਿਟਿਵ ਮਿਲੇ।</strong> ਛੋਟੀ ਸਮੱਗਰੀ ਸੂਚੀ ਵਾਲੇ ਉਤਪਾਦ ਚੁਣੋ।',
        avoidProduct: '<strong>ਇਸ ਉਤਪਾਦ ਤੋਂ ਬਚਣ ਬਾਰੇ ਸੋਚੋ।</strong> ਸਿਹਤਮੰਦ ਵਿਕਲਪ ਉਪਲਬਧ ਹਨ।',
        askAI: 'ਬਿਹਤਰ ਵਿਕਲਪਾਂ ਲਈ <strong>AI ਹੈਲਥ ਅਸਿਸਟੈਂਟ</strong> ਤੋਂ ਪੁੱਛੋ!',
        useModeration: '<strong>ਸੀਮਿਤ ਮਾਤਰਾ ਵਿੱਚ ਵਰਤੋ।</strong> ਇਹ ਸਭ ਤੋਂ ਮਾੜਾ ਨਹੀਂ ਹੈ, ਪਰ ਬਿਹਤਰ ਵਿਕਲਪ ਹਨ।',
        goodChoice: '<strong>ਚੰਗੀ ਚੋਣ!</strong> ਇਹ ਉਤਪਾਦ ਮੁਕਾਬਲਤਨ ਸਿਹਤਮੰਦ ਹੈ।',
        trackCalories: 'ਰੋਜ਼ਾਨਾ ਕੈਲੋਰੀ ਟ੍ਰੈਕ ਕਰੋ। <strong>ਵੇਟ ਮੈਨੇਜਮੈਂਟ</strong> ਟੈਬ ਵਰਤੋ।'
      }
    };

    const t = S[lang] || S.en;

    // Update badge text
    if (badge) {
      badge.innerHTML = `<i data-lucide="sparkles"></i> ${t.badge}`;
    }

    // Read current analysis data from DOM
    const score = parseFloat(document.getElementById('resultScore')?.textContent) || 5;
    const sugarLevel = document.getElementById('hlSugarVal')?.textContent || '';
    const processingLevel = document.getElementById('hlProcessingVal')?.textContent || '';
    const additivesLevel = document.getElementById('hlAdditivesVal')?.textContent || '';

    const suggestions = [];

    // Sugar-based suggestions
    if (['High', 'Very High'].includes(sugarLevel)) {
      suggestions.push({ icon: '🍬', text: t.highSugar });
      suggestions.push({ icon: '🥤', text: t.replaceDrinks });
    }

    // Processing-based
    if (['High', 'Ultra-Processed'].includes(processingLevel)) {
      suggestions.push({ icon: '🏭', text: t.ultraProcessed });
    }

    // Additives-based
    if (['Several', 'Many'].includes(additivesLevel)) {
      suggestions.push({ icon: '⚗️', text: t.manyAdditives });
    }

    // Score-based
    if (score < 4) {
      suggestions.push({ icon: '🚫', text: t.avoidProduct });
      suggestions.push({ icon: '💬', text: t.askAI });
    } else if (score < 7) {
      suggestions.push({ icon: '⚠️', text: t.useModeration });
    } else {
      suggestions.push({ icon: '✅', text: t.goodChoice });
    }

    // Always add
    suggestions.push({ icon: '📊', text: t.trackCalories });

    if (suggestions.length > 0) {
      content.innerHTML = suggestions.map(s => `
        <div class="ps-suggestion-item">
          <span class="ps-suggestion-icon">${s.icon}</span>
          <span class="ps-suggestion-text">${s.text}</span>
        </div>
      `).join('');
      container.classList.add('ps-suggestions-visible');
      if (window.lucide) setTimeout(() => lucide.createIcons(), 50);
    }
  }

  // ==========================================
  // UTILITY — Hide bottom nav on splash/loading
  // ==========================================
  function checkNavVisibility() {
    const nav = document.getElementById('psBottomNav');
    if (!nav) return;

    const splashActive = document.getElementById('splashScreen')?.classList.contains('active');
    const howActive = document.getElementById('howItWorksScreen')?.classList.contains('active');
    const loadingActive = document.getElementById('loadingScreen')?.classList.contains('active');

    if (splashActive || howActive || loadingActive) {
      nav.classList.add('ps-nav-hidden');
    } else {
      nav.classList.remove('ps-nav-hidden');
    }
  }

  // Observe screen changes for nav visibility
  const screenObserver = new MutationObserver(() => {
    checkNavVisibility();
  });

  // Start observing after DOM is ready
  function observeScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
      screenObserver.observe(screen, { attributes: true, attributeFilter: ['class'] });
    });
    checkNavVisibility();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(observeScreens, 300));
  } else {
    setTimeout(observeScreens, 300);
  }

})();
