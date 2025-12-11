document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const weightInput = document.getElementById('weight');
    const ferritinInput = document.getElementById('ferritin');
    const drugTabs = document.querySelectorAll('.tab-button');
    const deferoxamineBrandGroup = document.getElementById('deferoxamine-brand-group');
    const deferoxamineBrandSelect = document.getElementById('deferoxamine-brand');
    const deferasiroxTypeGroup = document.getElementById('deferasirox-type-group');
    const deferasiroxTypeSelect = document.getElementById('deferasirox-type');
    const ferritinFeedback = document.getElementById('ferritin-feedback');

    const resultSection = document.getElementById('result-section');
    const resultMainTitle = document.getElementById('result-main-title');
    const doseText = document.getElementById('dose-text');
    const doseDetails = document.getElementById('dose-details');
    const suggestionBox = document.getElementById('suggestion-box');
    const suggestionText = document.getElementById('suggestion-text');
    const warningMessages = document.getElementById('warning-messages');

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const quoteElement = document.getElementById('motivational-quote');

    const treatmentTypeRadios = document.querySelectorAll('input[name="treatment_type"]');
    const monoTherapyControls = document.getElementById('mono-therapy-controls');
    const comboTherapyControls = document.getElementById('combo-therapy-controls');
    const comboCheckboxes = document.querySelectorAll('input[name="combo_drug"]');

    let currentDrug = 'deferoxamine';
    let isComboMode = false;
    const motivationalQuotes = ["تو قوی‌تر از چیزی هستی که فکر می‌کنی.", "هر روز یک قدم، حتی کوچک، به سمت سلامتی بردار.", "قهرمان واقعی، تویی که با شجاعت زندگی می‌کنی.", "امید، قدرتمندترین داروی جهان است.", "فردای تو، روشن‌تر از امروز خواهد بود.", "لبخند بزن، تو الهام‌بخش دیگران هستی."];

    const applyTheme = (theme) => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); darkModeToggle.checked = theme === 'dark'; };
    const toggleTheme = () => { const newTheme = (localStorage.getItem('theme') || 'light') === 'light' ? 'dark' : 'light'; applyTheme(newTheme); };
    const showRandomQuote = () => { const randomIndex = Math.floor(Math.random() * motivationalQuotes.length); quoteElement.textContent = motivationalQuotes[randomIndex]; };

    const calculateAndDisplay = () => {
        const weight = parseFloat(weightInput.value);
        const ferritin = parseFloat(ferritinInput.value) || 0;

        resultSection.classList.add('hidden');
        ferritinFeedback.classList.add('hidden');
        suggestionBox.classList.add('hidden'); // Reset suggestion box
        warningMessages.innerHTML = '';
        ferritinFeedback.innerHTML = '';

        if (!weight || weight <= 0) return;

        if (ferritin > 0) {
            ferritinFeedback.classList.remove('hidden');
            if (ferritin < 1000) { ferritinFeedback.className = 'ferritin-feedback good'; ferritinFeedback.innerHTML = '<strong>عالیه!</strong> سطح فریتین شما در محدوده هدف قرار دارد. به همین مسیر خوب ادامه بده.'; }
            else if (ferritin >= 2500 && ferritin < 4000) { ferritinFeedback.className = 'ferritin-feedback high'; ferritinFeedback.innerHTML = '<strong>توجه:</strong> سطح فریتین شما بالاست. نگران نباشید، با درمان منظم کاهش پیدا می‌کند. حتماً در مورد دوز و برنامه درمانی خود با پزشک‌تان مشورت کنید.'; }
            else if (ferritin >= 4000) { ferritinFeedback.className = 'ferritin-feedback very-high'; ferritinFeedback.innerHTML = '<strong>هشدار جدی:</strong> سطح فریتین شما بسیار بالاست. لطفاً در اسرع وقت با پزشک خود مشورت کنید. ممکن است نیاز به درمان ترکیبی یا اقدامات دیگر داشته باشید.'; }
            else { ferritinFeedback.classList.add('hidden'); }
        }

        resultSection.classList.remove('hidden');

        if (isComboMode) {
            if (ferritin > 0 && ferritin < 2000) {
                addWarning('<strong>توجه:</strong> سطح فریتین شما مطلوب است. درمان ترکیبی معمولا برای فریتین‌های بسیار بالا توصیه می‌شود و برای شما ممکن است ریسک بالایی داشته باشد. <strong>حتماً با پزشک خود مشورت کنید.</strong>', 'warning');
            }
            calculateCombinationTherapy(weight, ferritin);
        } else {
            switch (currentDrug) {
                case 'deferoxamine': calculateDeferoxamine(weight, ferritin); break;
                case 'deferasirox': calculateDeferasirox(weight, ferritin); break;
                case 'deferiprone': calculateDeferiprone(weight, ferritin); break;
            }
        }
    };

    const getDosePerKg = (ferritin, doseMap) => {
        if (ferritin > 2500) return doseMap.high;
        if (ferritin > 0 && ferritin < 1000) return doseMap.low;
        return doseMap.mid;
    };

    // --- FIX: DFO Helper function to prioritize user's choice (500mg or 2000mg) and suggest optimized combination ---
    // preferredVial is now '500' or '2000' (string)
    const getVialText = (totalDose, preferredVial) => {
        if (totalDose <= 0) return { mainText: 'دوز بسیار پایین است', suggestion: '' };
        
        // Round to nearest 500mg
        const roundedDose = Math.round(totalDose / 500) * 500; 
        
        let mainPresentation = '';
        let totalVials;

        // Use '2000' for comparison
        if (preferredVial === '2000') { 
            // Priority on 2000mg vials (to minimize number of vials)
            let rem = roundedDose;
            const num2000mg = Math.floor(rem / 2000);
            rem %= 2000;
            const num500mg = Math.round(rem / 500);

            let parts = [];
            if (num2000mg > 0) parts.push(`${num2000mg} ویال ۲ گرم`);
            if (num500mg > 0) parts.push(`${num500mg} ویال ۵۰۰ میلی‌گرم`);
            mainPresentation = parts.join(' + ');
            totalVials = num2000mg + num500mg;

        // Use '500' for comparison
        } else if (preferredVial === '500') { 
            // Priority on 500mg vials
            totalVials = Math.ceil(roundedDose / 500);
            mainPresentation = `${totalVials} ویال ۵۰۰ میلی‌گرم`;
        } else {
             // Fallback to optimized (least number of vials) if value is unknown
             let remOpt = roundedDose;
             const num2000mgOpt = Math.floor(remOpt / 2000);
             remOpt %= 2000;
             const num500mgOpt = Math.round(remOpt / 500);
             let optimizedParts = [];
             if (num2000mgOpt > 0) optimizedParts.push(`${num2000mgOpt} ویال ۲ گرم`);
             if (num500mgOpt > 0) optimizedParts.push(`${num500mgOpt} ویال ۵۰۰ میلی‌گرم`);
             mainPresentation = optimizedParts.join(' + ');
             totalVials = num2000mgOpt + num500mgOpt;
        }

        // 2. Calculate the fully optimized (least number of vials) combination for the suggestion 
        let remOpt = roundedDose;
        const num2000mgOpt = Math.floor(remOpt / 2000);
        remOpt %= 2000;
        const num500mgOpt = Math.round(remOpt / 500);
        const optimizedVialsCount = num2000mgOpt + num500mgOpt;
        
        let suggestion = '';
        
        // Suggest optimization if the displayed choice leads to more vials than the optimized choice
        if (optimizedVialsCount < totalVials) {
            let optimizedParts = [];
            if (num2000mgOpt > 0) optimizedParts.push(`${num2000mgOpt} ویال ۲ گرم`);
            if (num500mgOpt > 0) optimizedParts.push(`${num500mgOpt} ویال ۵۰۰ میلی‌گرم`);
            
            suggestion = `<strong>پیشنهاد صرفه‌جویی:</strong> برای کاهش تعداد ویال‌های مصرفی و راحتی بیشتر، می‌توانید از ترکیب ${optimizedParts.join(' + ')} استفاده کنید.`;
        } else if (preferredVial === '500' && roundedDose >= 2000) {
             // If user chose 500mg but dose is high, remind them of 2g option
             suggestion = `<strong>توجه:</strong> اگر دوز بالاست، برای راحتی بیشتر می‌توانید از ویال‌های ۲ گرمی استفاده کنید.`;
        }
        
        return { mainText: `معادل ${mainPresentation}`, suggestion: suggestion, totalVials: totalVials };
    };

    const calculateDeferoxamine = (weight, ferritin) => {
        let dosePerKg = getDosePerKg(ferritin, { low: 30, mid: 42, high: 55 });
        dosePerKg = Math.min(dosePerKg, 60); // Max Dose Cap
        
        // Ensure preferredVial is retrieved correctly (e.g., '500' or '2000')
        const preferredVial = deferoxamineBrandSelect.value;
        
        // Intelligent Rounding for DFO (Round to nearest 500mg for practicality)
        const targetDose = weight * dosePerKg;
        const totalDose = Math.round(targetDose / 500) * 500; 

        resultMainTitle.textContent = 'دوز پیشنهادی روزانه';
        doseText.textContent = `${totalDose} میلی‌گرم`;
        doseDetails.innerHTML = `<div class="dose-per-kg-text">(بر اساس ${dosePerKg.toFixed(0)} میلی‌گرم بر کیلوگرم)</div>`;

        const vialInfo = getVialText(totalDose, preferredVial);
        doseDetails.innerHTML += `<span>${vialInfo.mainText}</span>`;
        
        // Display DFO suggestion
        if (vialInfo.suggestion) {
            suggestionText.innerHTML = vialInfo.suggestion; 
            suggestionBox.classList.remove('hidden'); 
        }

        addWarning('<strong>پایش لازم:</strong> شنوایی‌سنجی و بینایی‌سنجی سالانه', 'info');
    };

    // --- FIX: DFX Calculation for Coated (Jadenu) and Dissolvable (Exjade/Asoral) ---
    const calculateDeferasirox = (weight, ferritin) => {
        if (ferritin > 0 && ferritin < 300) { 
            resultMainTitle.textContent = 'دوز پیشنهادی روزانه'; doseText.textContent = "قطع موقت"; doseDetails.innerHTML = `<div class="dose-per-kg-text">(فریتین: ${ferritin})</div><span>سطح فریتین بسیار پایین است</span>`; addWarning('سطح فریتین زیر 300 است. مصرف دارو باید متوقف شود.', 'danger'); return; 
        }

        const dfxType = deferasiroxTypeSelect.value;
        let dosePerKg, maxDose, tabletSizes, doseUnit;

        if (dfxType === 'jadenu') { // NEW FORMULATION (360, 180, 90) - Coated (Jadenu/TalaJid)
            dosePerKg = getDosePerKg(ferritin, { low: 10, mid: 14, high: 24 });
            maxDose = 28;
            tabletSizes = [360, 180, 90];
            doseUnit = 90; 
        // Use 'exjade' for comparison, as per user's HTML
        } else if (dfxType === 'exjade') { // EXJADE/ASORAL (500, 250, 125) - Dissolvable (Exjade/Asoral)
             // Initial dose: 20 mg/kg, Max: 40 mg/kg (Used for mid range)
             dosePerKg = getDosePerKg(ferritin, { low: 15, mid: 20, high: 35 }); 
             maxDose = 40;
             tabletSizes = [500, 250, 125];
             doseUnit = 125; 
        } else {
             // Fallback: If no type is selected or type is unknown, default to the coated tablets (Jadenu)
             dosePerKg = getDosePerKg(ferritin, { low: 10, mid: 14, high: 24 });
             maxDose = 28;
             tabletSizes = [360, 180, 90];
             doseUnit = 90; 
             addWarning('<strong>توجه:</strong> نوع دفرازیروکس مشخص نشده است. محاسبات بر اساس قرص‌های روکش‌دار (مثل Jadenu) انجام شد.', 'info');
        }

        dosePerKg = Math.min(dosePerKg, maxDose);
        const doseResult = findTabletCombination(weight * dosePerKg, tabletSizes, doseUnit);

        resultMainTitle.textContent = 'دوز پیشنهادی روزانه';
        doseText.textContent = `${doseResult.totalDose} میلی‌گرم`;
        doseDetails.innerHTML = `<div class="dose-per-kg-text">(بر اساس ${dosePerKg.toFixed(0)} میلی‌گرم بر کیلوگرم)</div><span>${doseResult.combination}</span>`;
        addWarning('<strong>پایش لازم:</strong> آزمایش ماهانه عملکرد کلیه (کراتینین) و کبد', 'warning');

        // Display DFX suggestion
        if (doseResult.suggestion) {
            suggestionText.innerHTML = doseResult.suggestion; 
            suggestionBox.classList.remove('hidden'); 
        }
    };

    const calculateDeferiprone = (weight, ferritin) => {
        if (ferritin > 0 && ferritin < 500) addWarning('فریتین زیر ۵۰۰: مصرف دفریپرون معمولاً توصیه نمی‌شود. حتما با پزشک خود مشورت کنید.', 'danger');

        let dosePerKg = getDosePerKg(ferritin, { low: 65, mid: 80, high: 95 });
        dosePerKg = Math.min(dosePerKg, 99);
        const totalDosePerDay = weight * dosePerKg;
        
        // Intelligent Rounding for DFP (Round to nearest WHOLE tablet of 500mg)
        const numTablets = Math.round(totalDosePerDay / 500); 
        const finalTotalDose = numTablets * 500;

        resultMainTitle.textContent = 'دوز پیشنهادی روزانه';
        doseText.textContent = `${finalTotalDose} میلی‌گرم`;
        doseDetails.innerHTML = `<div class="dose-per-kg-text">(بر اساس ${dosePerKg.toFixed(0)} میلی‌گرم بر کیلوگرم)</div><span>معادل ${numTablets} قرص ۵۰۰ میلی‌گرمی در روز</span>`;
        if (numTablets > 0) { 
            suggestionText.innerHTML = `<strong>نحوه مصرف:</strong> در ۳ نوبت در روز. مثلاً: ${Math.ceil(numTablets / 3)} قرص صبح، ${Math.floor(numTablets / 3)} قرص ظهر و ${Math.floor(numTablets / 3)} قرص شب.`; 
            suggestionBox.classList.remove('hidden'); 
        }
        addWarning('<strong>پایش لازم:</strong> آزمایش هفتگی خون (CBC) برای کنترل گلبول‌های سفید', 'danger');
    };

    const calculateCombinationTherapy = (weight, ferritin) => {
        const selectedDrugs = Array.from(document.querySelectorAll('input[name="combo_drug"]:checked')).map(el => el.value);
        doseText.textContent = ''; doseDetails.innerHTML = '';
        suggestionBox.classList.add('hidden'); // Ensure suggestion box is hidden for combo

        if (selectedDrugs.length < 2) { addWarning('برای محاسبه پروتکل درمان ترکیبی، لطفاً حداقل دو دارو را انتخاب کنید.', 'warning'); return; }

        resultMainTitle.textContent = 'پروتکل ترکیبی پیشنهادی (اولویت با مصرف روزانه)';
        let monitoring = new Set();
        let htmlDetails = '';

        // Priority 1: Triple Therapy (Emergency only)
        if (selectedDrugs.length === 3) {
            const doseMap = ferritin > 5000 ? { dfp: 80, dfx: 20, dfo: 50, dfoDays: 5 } : { dfp: 70, dfx: 15, dfo: 40, dfoDays: 4 };
            
            const dfpTotal = Math.round((weight * Math.min(doseMap.dfp, 99)) / 500) * 500;
            const dfxResult = findTabletCombination(weight * Math.min(doseMap.dfx, 28), [360, 180, 90], 90); // Assumes Jadenu/Coated in combo
            // Daily equivalent dose (DFO kg * 7 days / DFO days per week)
            const dfoTotalInjectionDose = Math.round((weight * doseMap.dfo * 7 / doseMap.dfoDays) / 500) * 500; 
            const dfoVialInfo = getVialText(dfoTotalInjectionDose, '500'); // Use 500mg vial for combo calc simplicity

            htmlDetails += `<div class="combo-result"><span><strong>دفریپرون:</strong> ${dfpTotal} میلی‌گرم (${dfpTotal/500} قرص)</span><span class="dose-per-kg-text">(بر اساس ${doseMap.dfp} mg/kg)</span><span class="combo-days">هر روز (سه نوبت)</span></div>`
                          + `<div class="combo-result"><span><strong>دفراسیروکس:</strong> ${dfxResult.totalDose} میلی‌گرم (${dfxResult.combination})</span><span class="dose-per-kg-text">(بر اساس ${doseMap.dfx} mg/kg)</span><span class="combo-days">هر روز (یک نوبت)</span></div>`
                          + `<div class="combo-result"><span><strong>دفروکسامین:</strong> ${dfoTotalInjectionDose} میلی‌گرم (${dfoVialInfo.mainText.replace('معادل ','')})</span><span class="dose-per-kg-text">(دوز تزریق، معادل ${doseMap.dfo} mg/kg روزانه)</span><span class="combo-days"><strong>${doseMap.dfoDays} روز در هفته</strong></span></div>`;
            addWarning('<strong>🚨 خطر! درمان سه‌دارویی 🚨</strong><br>این پروتکل بسیار پرخطر بوده و فقط در شرایط بحرانی (مثل نارسایی قلبی)، در ICU و با نظارت لحظه‌ای تیم فوق تخصصی استفاده می‌شود. این بخش صرفاً جهت آگاهی از پیچیدگی درمان است.', 'danger');
            monitoring.add('CBC هفتگی').add('کراتینین/کبد ماهانه').add('شنوایی/بینایی سالانه');
        
        // Priority 2: Double Therapy (Check specific pairs)
        } else if (selectedDrugs.includes('deferiprone') && selectedDrugs.includes('deferasirox')) {
             const doseMap = ferritin > 5000 ? { dfp: 90, dfx: 28 } : { dfp: 75, dfx: 24 };
             const dfpTotal = Math.round((weight * Math.min(doseMap.dfp, 99)) / 500) * 500;
             const dfpTablets = dfpTotal / 500;
             const dfxResult = findTabletCombination(weight * Math.min(doseMap.dfx, 28), [360, 180, 90], 90); // Assumes Jadenu/Coated in combo

             htmlDetails += `<div class="combo-result"><span><strong>دفریپرون:</strong> ${dfpTotal} میلی‌گرم (${dfpTablets} قرص)</span><span class="dose-per-kg-text">(بر اساس ${doseMap.dfp} mg/kg)</span><span class="combo-days">هر روز (سه نوبت)</span></div>`
                          + `<div class="combo-result"><span><strong>دفراسیروکس:</strong> ${dfxResult.totalDose} میلی‌گرم (${dfxResult.combination})</span><span class="dose-per-kg-text">(بر اساس ${doseMap.dfx} mg/kg)</span><span class="combo-days">هر روز (یک نوبت)</span></div>`;
             monitoring.add('CBC هفتگی').add('کراتینین/کبد ماهانه');


        } else if (selectedDrugs.includes('deferiprone') && selectedDrugs.includes('deferoxamine')) {
            const dfoDays = ferritin > 4000 ? 5 : ferritin > 2500 ? 4 : 3; 
            const baseDosePerDay = ferritin > 5000 ? 100 : ferritin > 2500 ? 90 : 80; 
            
            const dfpKg = Math.min(75, baseDosePerDay - 25); 
            const dfoKgEquivalent = baseDosePerDay - dfpKg; 
            
            const dfpTotal = Math.round((weight * dfpKg) / 500) * 500;
            const dfpTablets = dfpTotal / 500;
            
            const dfoTotalInjectionDose = Math.round((weight * dfoKgEquivalent * 7 / dfoDays) / 500) * 500;
            const dfoVialInfo = getVialText(dfoTotalInjectionDose, '500'); // Use 500mg vial for combo calc simplicity
            
            htmlDetails += `<div class="combo-result"><span><strong>دفریپرون:</strong> ${dfpTotal} میلی‌گرم (${dfpTablets} قرص)</span><span class="dose-per-kg-text">(بر اساس ${dfpKg} mg/kg)</span><span class="combo-days">هر روز (سه نوبت)</span></div>`
                         + `<div class="combo-result"><span><strong>دفروکسامین:</strong> ${dfoTotalInjectionDose} میلی‌گرم (${dfoVialInfo.mainText.replace('معادل ','')})</span><span class="dose-per-kg-text">(دوز تزریق، معادل ${dfoKgEquivalent.toFixed(0)} mg/kg روزانه)</span><span class="combo-days"><strong>${dfoDays} روز در هفته</strong></span></div>`;
            monitoring.add('CBC هفتگی').add('شنوایی/بینایی سالانه');

        } else if (selectedDrugs.includes('deferoxamine') && selectedDrugs.included('deferasirox')) {
            const dfoDays = ferritin > 4000 ? 4 : ferritin > 2500 ? 3 : 2; 
            const baseDosePerDay = ferritin > 5000 ? 50 : ferritin > 2500 ? 45 : 40; 
            
            const dfxKg = Math.min(25, baseDosePerDay - 15); 
            const dfoKgEquivalent = baseDosePerDay - dfxKg; 
            
            const dfxResult = findTabletCombination(weight * dfxKg, [360, 180, 90], 90); // Assumes Jadenu/Coated in combo
            
            const dfoTotalInjectionDose = Math.round((weight * dfoKgEquivalent * 7 / dfoDays) / 500) * 500; 
            const dfoVialInfo = getVialText(dfoTotalInjectionDose, '500'); // Use 500mg vial for combo calc simplicity

            htmlDetails += `<div class="combo-result"><span><strong>دفراسیروکس:</strong> ${dfxResult.totalDose} میلی‌گرم (${dfxResult.combination})</span><span class="dose-per-kg-text">(بر اساس ${dfxKg.toFixed(0)} mg/kg)</span><span class="combo-days"><strong>در روزهای بدون تزریق</strong></span></div>`
                         + `<div class="combo-result"><span><strong>دفروکسامین:</strong> ${dfoTotalInjectionDose} میلی‌گرم (${dfoVialInfo.mainText.replace('معادل ','')})</span><span class="dose-per-kg-text">(دوز تزریق، معادل ${dfoKgEquivalent.toFixed(0)} mg/kg روزانه)</span></span><span class="combo-days"><strong>${dfoDays} روز در هفته</strong></span></div>`;
            monitoring.add('کراتینین/کبد ماهانه').add('شنوایی/بینایی سالانه');
            addWarning('<strong>تذکر:</strong> بهتر است دفرازیروکس و دفروکسامین در **روزهای متفاوت** مصرف شوند تا ریسک عوارض کلیوی کاهش یابد.', 'warning');
        
        } else {
             htmlDetails = `<span>پروتکل ترکیبی برای این دو دارو استاندارد نیست. لطفاً با پزشک متخصص مشورت کنید.</span>`;
        }

        doseDetails.innerHTML = htmlDetails;
        if(selectedDrugs.length === 2 || selectedDrugs.length === 3) addWarning('<strong>خطر:</strong> درمان ترکیبی ریسک عوارض را افزایش می‌دهد و <strong>فقط و فقط</strong> باید تحت نظارت دقیق پزشک متخصص انجام شود.', 'danger');
        if(monitoring.size > 0) addWarning(`<strong>پایش‌های لازم:</strong> ${[...monitoring].join('، ')}`, 'warning');
    };

    // --- findTabletCombination for DFX (Minimizing Variety) ---
    const findTabletCombination = (targetDose, tablets, unit) => {
        
        const largestTablet = tablets[0]; // e.g., 360 or 500
        
        // Option B: Clinically safe dose (rounded to nearest unit)
        const doseB = Math.round(targetDose / unit) * unit;
        
        // Option A: Round to nearest multiple of the largest tablet (for cleaner prescription, e.g., multiples of 360)
        const numLargest = Math.round(targetDose / largestTablet);
        const doseA = numLargest * largestTablet;
        
        // Decision: If Dose A is within 1 unit (e.g., 90mg or 125mg) of the clinically safe Dose B, use Dose A for cleaner prescription.
        const diff = Math.abs(doseA - doseB);
        
        let finalDose;
        let suggestion = '';

        // Only try Dose A if it results in at least one largest tablet and is acceptably close
        if (numLargest >= 1 && diff <= unit) { 
            finalDose = doseA;
            if (doseA !== doseB) {
                 suggestion = `<strong>تعدیل دوز:</strong> دوز محاسبه شده از ${doseB} به ${finalDose} میلی‌گرم رند شد تا مصرف قرص‌ها (به صورت ${numLargest} عدد قرص ${largestTablet} میلی‌گرم) ساده‌تر باشد.`;
            }
        } else {
            // Otherwise, stick to the clinically safer, unit-rounded dose
            finalDose = doseB;
            
            // Check if Dose B requires variety (more than one tablet size or more than one tablet total) for suggestion
            let remCheck = finalDose;
            let largestCount = Math.floor(remCheck / largestTablet);
            remCheck -= largestCount * largestTablet;
            
            if (remCheck > 0 && finalDose > largestTablet) {
                suggestion = `<strong>سادگی مصرف:</strong> دوز نهایی ${finalDose} میلی‌گرم است که با ترکیب چند قرص حاصل شده است. با مشورت پزشک، می‌توانید دوز را به نزدیک‌ترین مضرب ${largestTablet} میلی‌گرم تغییر دهید.`;
            }
        }

        let rem = finalDose; 
        let comb = [];
        
        // Now find the combination for the FINAL_DOSE (prioritizing large tablets)
        tablets.sort((a, b) => b - a).forEach(s => { 
            const count = Math.floor(rem / s); 
            if (count > 0) { 
                comb.push(`${count} عدد قرص <span dir="ltr">${s} میلی‌گرم</span>`); 
                rem -= count * s; 
            } 
        });


        return { totalDose: finalDose, combination: comb.join(' + ') || 'دوز بسیار پایین است', suggestion: suggestion };
    };

    const addWarning = (message, type) => { const p = document.createElement('p'); p.className = type; p.innerHTML = message; warningMessages.appendChild(p); };

    // --- Event Listeners ---
    treatmentTypeRadios.forEach(radio => radio.addEventListener('change', (e) => {
        isComboMode = e.target.value === 'combo';
        monoTherapyControls.classList.toggle('hidden', isComboMode);
        comboTherapyControls.classList.toggle('hidden', !isComboMode);

        // When switching to mono-therapy, ensure the correct mono-therapy dropdown is displayed
        if (!isComboMode) {
             // Reset: Hide both optional dropdowns first
            deferoxamineBrandGroup.classList.add('hidden');
            deferasiroxTypeGroup.classList.add('hidden');

            // Show the currently selected drug's dropdown
            if (currentDrug === 'deferoxamine') {
                deferoxamineBrandGroup.classList.remove('hidden');
            } else if (currentDrug === 'deferasirox') {
                deferasiroxTypeGroup.classList.remove('hidden');
            }
        }
        
        calculateAndDisplay();
    }));

    // --- FIX: Logic for showing/hiding dropdowns on tab switch ---
    drugTabs.forEach(tab => tab.addEventListener('click', () => {
        currentDrug = tab.dataset.drug;
        drugTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // 1. Reset: Hide both optional dropdowns first (using the 'hidden' class)
        deferoxamineBrandGroup.classList.add('hidden');
        deferasiroxTypeGroup.classList.add('hidden');
        
        // 2. Show the relevant one by removing the 'hidden' class
        if (currentDrug === 'deferoxamine') {
            deferoxamineBrandGroup.classList.remove('hidden');
        } else if (currentDrug === 'deferasirox') {
            deferasiroxTypeGroup.classList.remove('hidden');
        }
        
        calculateAndDisplay();
    }));

    comboCheckboxes.forEach(cb => cb.addEventListener('change', calculateAndDisplay));
    [weightInput, ferritinInput, deferoxamineBrandSelect, deferasiroxTypeSelect].forEach(el => el.addEventListener('input', calculateAndDisplay));
    darkModeToggle.addEventListener('change', toggleTheme);

    // --- PWA Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // FIX: Increment cache name to force update
            navigator.serviceWorker.register('/sw.js').then(reg => console.log('SW registered!'), err => console.log('SW registration failed: ', err));
        });
    }

    // --- Initial Setup ---
    applyTheme(localStorage.getItem('theme') || 'light');
    showRandomQuote();
    // Ensure initial state reflects the active tab (deferoxamine)
    deferasiroxTypeGroup.classList.add('hidden'); // Ensure DFX is hidden on load
    deferoxamineBrandGroup.classList.remove('hidden'); // Ensure DFO is shown on load
    calculateAndDisplay();
});
