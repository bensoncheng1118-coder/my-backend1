// 各解剖構造的中文名稱、功能與重點。
// 聽覺部分的用語與數據參考「聽語神經科學解剖機轉」讀書筆記（耳部解剖學(一)(二)、耳蝸機制與過程）。
// 欄位：zh 中文名、en 英文名、cat 分類、func 功能、points 重點、clinical 臨床關聯、abr 相關電生理、tools 站內相關工具

export const INFO = {
  // ───────────── 外耳 ─────────────
  pinna: {
    zh: '耳廓', en: 'Pinna / Auricle', cat: '外耳',
    func: '收集聲波並導入外耳道；耳廓的皺褶會對不同方向來的聲音造成不同的頻譜濾波，提供垂直方向與前後方向的定位線索。',
    points: ['由彈性軟骨構成（耳垂除外），外覆皮膚', '主要構造：耳輪、對耳輪、耳甲、耳屏、對耳屏、耳垂', '耳甲腔共振約在 5 kHz 附近，提供高頻增益', '高頻（約 4 kHz 以上）的頻譜凹陷是判斷聲源仰角的主要線索'],
    clinical: '小耳症、耳廓外傷（菜花耳）；助聽器麥克風位置會影響耳廓效應。'
  },
  ear_canal: {
    zh: '外耳道', en: 'External acoustic meatus (EAC)', cat: '外耳',
    func: '把聲音從耳甲傳到鼓膜，同時保護鼓膜；一端封閉的管子會產生共振，放大語音重要頻段。',
    points: ['長約 2.5 cm，略呈 S 形', '外 1/3 為軟骨部（有耵聹腺、毛髮），內 2/3 為骨部（由顳骨鼓室部構成）', '四分之一波長共振約 2.5–3 kHz，增益約 10–15 dB', '外耳道骨性部分由顳骨鼓室部構成，頂部有一小部分是鱗狀部'],
    clinical: '耵聹栓塞、外耳炎、外耳道閉鎖都會造成傳導性聽損（氣骨導差）。',
    tools: [['純音聽力檢查模擬器', '/check']]
  },
  // ───────────── 中耳 ─────────────
  tm: {
    zh: '鼓膜', en: 'Tympanic membrane', cat: '中耳',
    func: '把外耳道的空氣壓力變化轉成機械振動，傳給附著其上的錘骨柄。',
    points: ['厚約 0.1 mm，呈向內凹的淺圓錐，最凹處為臍（umbo）', '三層：外層上皮、中間纖維層、內層黏膜', '分為緊張部與鬆弛部；光錐位於前下象限', '有效振動面積約 55 mm²，與鐙骨足板（約 3.2 mm²）面積比約 17:1，是中耳增益的主要來源'],
    clinical: '鼓膜穿孔、中耳積液（鼓室圖 B 型）、鼓膜內陷；中耳壓力異常時鼓室圖峰值偏移（C 型）。',
    tools: [['純音聽力檢查模擬器', '/check']]
  },
  tympanic_cavity: {
    zh: '鼓室（中耳腔）', en: 'Tympanic cavity', cat: '中耳',
    func: '位於顳骨岩部內、充滿空氣的腔室，容納聽小骨鏈；讓鼓膜兩側氣壓平衡後才能有效振動。',
    points: ['向上延伸為上鼓室（attic / epitympanic recess），經乳突房通道（aditus ad antrum）通往乳突房', '前下方經耳咽管通往鼻咽', '內側壁有卵圓窗、圓窗與岬（promontory，耳蝸基底轉的隆起）', '中耳的阻抗匹配：面積比約 17 倍 × 錘砧骨槓桿約 1.3 倍 ≈ 22 倍，約補償 25–30 dB'],
    clinical: '中耳炎、膽脂瘤；中耳病變造成傳導性聽損。'
  },
  malleus: {
    zh: '錘骨', en: 'Malleus', cat: '中耳・聽小骨',
    func: '聽小骨鏈的第一塊骨頭；錘骨柄嵌在鼓膜上，把鼓膜振動傳給砧骨。',
    points: ['構造：錘骨頭、頸、外側突、前突、錘骨柄', '錘骨頭位於上鼓室，與砧骨體形成關節', '鼓膜張肌附著於錘骨柄上端', '錘骨柄比砧骨長突長，形成約 1.3:1 的槓桿比'],
    clinical: '錘骨固定、聽小骨鏈中斷都會造成傳導性聽損。'
  },
  incus: {
    zh: '砧骨', en: 'Incus', cat: '中耳・聽小骨',
    func: '連接錘骨與鐙骨，和錘骨一起像槓桿般轉動，把振動傳給鐙骨。',
    points: ['構造：砧骨體、短腳、長腳、豆狀突', '砧骨體與錘骨頭形成關節；豆狀突與鐙骨頭相接', '短腳以韌帶固定在上鼓室後壁'],
    clinical: '慢性中耳炎或膽脂瘤常侵蝕砧骨長腳，造成聽小骨鏈中斷。'
  },
  stapes: {
    zh: '鐙骨', en: 'Stapes', cat: '中耳・聽小骨',
    func: '人體最小的骨頭；鐙骨足板像活塞一樣在卵圓窗前後運動，把振動傳進前庭階的外淋巴液。',
    points: ['構造：鐙骨頭、前腳、後腳、足板', '足板面積約 3.2 mm²，以環狀韌帶固定在卵圓窗', '鐙骨肌附著於鐙骨頸'],
    clinical: '耳硬化症使鐙骨足板固定，造成傳導性聽損，骨導在 2 kHz 出現 Carhart notch；手術可做鐙骨切除或人工鐙骨。',
    tools: [['純音聽力檢查模擬器', '/check']]
  },
  tensor_tympani: {
    zh: '鼓膜張肌', en: 'Tensor tympani', cat: '中耳・肌肉',
    func: '收縮時把錘骨柄向內拉，使鼓膜繃緊、降低聽小骨鏈的傳導。',
    points: ['由三叉神經（CN V）下頷枝支配', '位於耳咽管上方的骨管內，肌腱繞過匙狀突附著於錘骨柄', '人類主要在驚嚇、吞嚥、自身發聲時收縮'],
    clinical: '鼓膜張肌陣攣可能造成耳內規律聲響。'
  },
  stapedius: {
    zh: '鐙骨肌', en: 'Stapedius', cat: '中耳・肌肉',
    func: '受強聲刺激時反射性收縮（聽反射 / 鐙骨肌反射），把鐙骨往後拉，降低低頻聲音傳入，保護內耳。',
    points: ['由顏面神經（CN VII）支配', '人體最小的骨骼肌，起於錐隆起', '聽反射弧：耳蝸 → 聽神經 → 耳蝸神經核 → 上橄欖複合體 → 兩側顏面神經核 → 兩側鐙骨肌', '單側刺激會引起雙側反射'],
    clinical: '顏面神經麻痺時鐙骨肌失能，會出現聽覺過敏；臨床用聽反射閾值與衰退檢查來鑑別病灶位置。',
    abr: '相關檢查：聽反射（acoustic reflex）'
  },
  eustachian: {
    zh: '耳咽管', en: 'Eustachian (auditory) tube', cat: '中耳',
    func: '連接中耳腔與鼻咽，平時關閉；吞嚥、打哈欠時打開，平衡中耳氣壓並引流分泌物。',
    points: ['成人長約 3.5–3.8 cm，靠中耳 1/3 為骨部、靠鼻咽 2/3 為軟骨部', '主要由腭帆張肌打開（腭帆提肌、耳咽管咽肌協助）', '兒童的耳咽管較短、較平、較寬'],
    clinical: '耳咽管功能不良是兒童中耳炎、中耳積液的主因；腭裂兒童因腭帆張肌附著異常更容易發生。'
  },
  oval_window: {
    zh: '卵圓窗', en: 'Oval window', cat: '內耳',
    func: '鐙骨足板所在的開口，是振動進入耳蝸前庭階的入口。',
    points: ['位於中耳內側壁、岬的後上方', '由環狀韌帶封住鐙骨足板與窗緣的空隙'],
    clinical: '外淋巴瘻管可能發生在卵圓窗或圓窗，造成波動性聽損與眩暈。'
  },
  round_window: {
    zh: '圓窗', en: 'Round window', cat: '內耳',
    func: '鼓階末端的薄膜（第二鼓膜）。鐙骨往內推時圓窗往外凸，讓不可壓縮的淋巴液可以流動，行進波才能產生。',
    points: ['與卵圓窗反相運動', '若聲音同時、同相到達兩窗，效果會互相抵消', '人工電子耳電極常經由圓窗插入鼓階'],
    clinical: '中耳手術與人工電子耳植入的重要標記。'
  },
  cochlea: {
    zh: '耳蝸', en: 'Cochlea', cat: '內耳',
    func: '把淋巴液的機械振動轉成神經電訊號，並依頻率在不同位置分析（音調排列 / tonotopy）。',
    points: ['約 2.5–2.75 圈，展開長約 35 mm，繞著蝸軸（modiolus）盤旋', '內分三階：前庭階、中階（耳蝸管）、鼓階；前庭階與鼓階在蝸孔（helicotrema）相通', '基底膜在基部窄而硬、對高頻敏感；頂部寬而軟、對低頻敏感（模型顏色：紅＝高頻基部，藍＝低頻頂部）', '行進波（von Békésy）由基部往頂部傳，在特定位置達到最大振幅', '外毛細胞的主動放大（耳蝸放大器）提供約 40–50 dB 的增益與尖銳的頻率選擇性'],
    clinical: '噪音性聽損（4 kHz 凹陷）、老年性聽損、耳毒性藥物多先傷害基部的高頻區。',
    abr: '耳蝸微音電位 CM、總和電位 SP；耳聲傳射 OAE',
    tools: [['耳蝸電位', '/wave3'], ['雙音抑制', '/two_tone']]
  },
  vestibule: {
    zh: '前庭', en: 'Vestibule (utricle & saccule)', cat: '內耳・平衡',
    func: '內含橢圓囊與球狀囊，偵測直線加速度與頭部相對重力的傾斜。',
    points: ['橢圓囊偵測水平方向、球狀囊偵測垂直方向的直線加速度', '耳石膜上的耳石（碳酸鈣結晶）讓毛細胞對重力敏感', '球狀囊對強聲也有反應，臨床用來做 cVEMP'],
    clinical: '耳石脫落進入半規管是良性陣發性姿勢性眩暈（BPPV）的成因。'
  },
  scc: {
    zh: '半規管', en: 'Semicircular canals', cat: '內耳・平衡',
    func: '三個互相垂直的半規管偵測頭部的旋轉（角加速度）。',
    points: ['前（上）、後、外側（水平）三個半規管', '每個半規管一端膨大為壺腹，內有壺腹嵴與頂帽', '兩側相對應的半規管成對運作（推拉原理）'],
    clinical: '前庭神經炎、梅尼爾氏症都會造成眩暈；溫差測驗主要評估外側半規管。'
  },
  spiral_ganglion: {
    zh: '螺旋神經節', en: 'Spiral ganglion', cat: '內耳・神經',
    func: '聽覺一級神經元的細胞本體所在處，位於蝸軸內（Rosenthal 管），把毛細胞的訊息送往腦幹。',
    points: ['約 30,000 個雙極神經元', '第一型（約 95%）：較大、有髓鞘、雙極，以內放射纖維連接內毛細胞，是主要聽覺訊息的傳遞者', '第二型（約 5%）：較小、無髓鞘、偽單極，以外螺旋纖維跨過柯地氏管連接外毛細胞', '每個內毛細胞約有 10 條（10–20 條）第一型纖維；第一型纖維依自發放電率分為高、中、低三類'],
    clinical: '人工電子耳直接電刺激螺旋神經節細胞，所以神經節細胞存活數影響植入效果。'
  },
  cn8: {
    zh: '前庭耳蝸神經（第 8 對腦神經）', en: 'Vestibulocochlear nerve (CN VIII)', cat: '神經',
    func: '耳蝸分支（聽神經）把聲音訊息從螺旋神經節送到同側耳蝸神經核；前庭分支傳送平衡訊息。',
    points: ['經內聽道（internal auditory meatus）進入顱內，在橋腦小腦角、延腦與橋腦交界處進入腦幹', '聽神經約 30,000 條纖維：中心纖維來自蝸頂、連接內毛細胞；外層纖維來自基部、連接外毛細胞（扭曲束狀走向）', '以放電頻率編碼強度，以位置與相位鎖定（約 4–5 kHz 以下）編碼頻率', '同一條纖維只對特徵頻率最敏感（調諧曲線）'],
    clinical: '聽神經瘤（前庭神經鞘瘤）造成單側感音神經性聽損與 ABR 波間潛時延長；聽神經病變（ANSD）OAE 正常但 ABR 異常。',
    abr: 'ABR 波 I（遠端）、波 II（近端）',
    tools: [['rate-level function', '/cochlear']]
  },
  facial_nerve: {
    zh: '顏面神經（第 7 對腦神經）', en: 'Facial nerve (CN VII)', cat: '神經',
    func: '支配臉部表情肌與鐙骨肌，也傳送舌前 2/3 味覺；與聽神經一起穿過內聽道，再穿過中耳內側壁。',
    points: ['鐙骨肌支是聽反射的傳出端', '鼓索神經穿過中耳腔，傳舌前 2/3 味覺', '中耳手術需避開顏面神經管'],
    clinical: '貝爾氏麻痺若影響到鐙骨肌支，會出現聽覺過敏與聽反射消失。'
  },
  temporal_bone: {
    zh: '顳骨', en: 'Temporal bone', cat: '骨骼',
    func: '容納並保護中耳與內耳；顱骨 8 塊中顳骨佔 2 塊。',
    points: ['四個部分：鱗狀部、乳突部、岩部、鼓室部，另有莖突', '岩部最堅硬，內有中耳腔、上鼓室與內耳', '乳突內有互相連通的乳突氣室', '鼓室部構成外耳道的骨性部分；鱗狀部的下頷窩構成顳顎關節'],
    clinical: '顳骨骨折可能造成傳導性或感音性聽損、顏面神經麻痺；骨導聽力經由顳骨振動傳入耳蝸。'
  },

  // ───────────── 耳蝸剖面（柯地氏器） ─────────────
  scala_vestibuli: {
    zh: '前庭階', en: 'Scala vestibuli', cat: '耳蝸剖面',
    func: '耳蝸上方的管道，充滿外淋巴液；鐙骨的振動由卵圓窗進入這裡。',
    points: ['外淋巴液：高鈉、低鉀，成分類似細胞外液', '在蝸孔與鼓階相通', '以 Reissner 氏膜與中階分隔']
  },
  scala_media: {
    zh: '中階（耳蝸管）', en: 'Scala media (cochlear duct)', cat: '耳蝸剖面',
    func: '充滿內淋巴液的三角形管道，柯地氏器就在它的底部；內淋巴的高鉀與正電位是毛細胞換能的動力來源。',
    points: ['內淋巴液：高鉀（約 150 mM）、低鈉', '內淋巴電位（EP）約 +80 mV，由血管紋產生', '與毛細胞內約 −45 至 −70 mV 的電位合計，形成約 120–150 mV 的電位差，驅動鉀離子流入毛細胞'],
    clinical: '梅尼爾氏症為內淋巴水腫（中階膨大），造成波動性低頻聽損、耳鳴、耳脹與眩暈。'
  },
  scala_tympani: {
    zh: '鼓階', en: 'Scala tympani', cat: '耳蝸剖面',
    func: '耳蝸下方的管道，充滿外淋巴液，終止於圓窗，讓壓力得以釋放。',
    points: ['以基底膜和骨性螺旋板與中階、柯地氏器分隔', '人工電子耳的電極陣列植入在鼓階內']
  },
  reissner: {
    zh: 'Reissner 氏膜（前庭膜）', en: 'Reissner membrane', cat: '耳蝸剖面',
    func: '分隔前庭階與中階的極薄膜，維持內、外淋巴液的離子差異。',
    points: ['只有兩層細胞厚', '從螺旋緣斜向延伸到耳蝸外側壁'],
    clinical: '內淋巴水腫時 Reissner 氏膜會向前庭階膨出。'
  },
  basilar: {
    zh: '基底膜', en: 'Basilar membrane', cat: '耳蝸剖面',
    func: '承載柯地氏器；聲音造成的壓力差使基底膜上下振動，形成由基部往頂部的行進波。',
    points: ['內側連骨性螺旋板，外側連螺旋韌帶', '基部窄（約 0.1 mm）、硬 → 對高頻共振；頂部寬（約 0.5 mm）、軟 → 對低頻共振', '每個頻率在基底膜特定位置達到最大振幅（位置理論）', '按「傳導動畫」可看到基底膜與毛細胞一起振動'],
    tools: [['耳蝸電位', '/wave3']]
  },
  tectorial: {
    zh: '覆膜', en: 'Tectorial membrane', cat: '耳蝸剖面・柯地氏器',
    func: '覆蓋在毛細胞上方的膠狀膜。基底膜振動時，它與網狀板之間產生剪切力，使靜纖毛偏折。',
    points: ['強健連接在螺旋緣的上唇；脆弱連接在漢生細胞或狄特氏細胞', '膠狀稠度：可變形但不易流動', '成分為蛋白質，膠原 II 型纖維提供張力強度，在耳蝸基部最硬', '外毛細胞最長的靜纖毛嵌入覆膜；內毛細胞的靜纖毛不與覆膜連接，靠內淋巴液流動帶動']
  },
  ihc: {
    zh: '內毛細胞（IHC）', en: 'Inner hair cells', cat: '耳蝸剖面・柯地氏器',
    func: '真正的聽覺感覺受器：把靜纖毛的偏折轉成受器電位，釋放麩胺酸（glutamate）給第一型聽神經纖維。',
    points: ['1 排，約 3,500 個', '燒瓶狀（flask shape）', '頂部有角質板，靜纖毛呈 W 或 U 狀排列，由交聯的肌動蛋白絲構成', '靜纖毛不與覆膜連接', '約 95% 的傳入神經纖維連接內毛細胞'],
    clinical: '內毛細胞或其突觸受損（隱性聽損）時，純音閾值可能正常，但噪音中聽辨變差。',
    abr: '總和電位 SP 主要來自內毛細胞'
  },
  ohc: {
    zh: '外毛細胞（OHC）', en: 'Outer hair cells', cat: '耳蝸剖面・柯地氏器',
    func: '耳蝸放大器：受刺激後細胞體會伸縮（電致運動，prestin 蛋白），放大基底膜振動，提高敏感度與頻率選擇性。',
    points: ['3 排，每排約 4,000 個，共約 12,000 個', '圓柱狀 / 試管狀', '靜纖毛呈 W 狀排列，最長的靜纖毛嵌入覆膜', '受橄欖耳蝸束（MOC）傳出神經支配，可降低增益', '產生耳聲傳射（OAE）'],
    clinical: '最容易被噪音與耳毒性藥物傷害；外毛細胞受損約造成 40–60 dB 的聽損並使頻率選擇性變差。臨床以 OAE 篩檢。',
    abr: '耳蝸微音電位 CM、耳聲傳射 OAE',
    tools: [['雙音抑制與對側抑制', '/two_tone']]
  },
  stereocilia: {
    zh: '靜纖毛', en: 'Stereocilia', cat: '耳蝸剖面・柯地氏器',
    func: '毛細胞頂端的機械換能構造；往最高一排方向偏折時，尖端連接拉開離子通道，鉀離子流入使毛細胞去極化。',
    points: ['由交聯的肌動蛋白絲構成，高低排列成階梯狀', '尖端連接（tip link）：從短靜纖毛連到長靜纖毛，是最重要的連接，毛細胞移動時拉緊並打開離子通道', '其他連接：軸部連接、踝部連接、邊對邊與排對排交叉連接', '在許多物種中，從基部到頂部靜纖毛越來越長（基部較短）', '成人的動纖毛已退化']
  },
  pillar: {
    zh: '柱細胞與柯地氏管', en: 'Pillar cells & tunnel of Corti', cat: '耳蝸剖面・柯地氏器',
    func: '內、外柱細胞形成三角形的柯地氏管，提供柯地氏器堅固的支架，把基底膜的運動傳到網狀板。',
    points: ['柯地氏管內充滿類似外淋巴的液體（Cortilymph）', '第二型聽神經纖維與傳出纖維會穿過柯地氏管到達外毛細胞']
  },
  supporting: {
    zh: '支持細胞', en: 'Supporting cells', cat: '耳蝸剖面・柯地氏器',
    func: '支撐毛細胞並維持離子代謝與恆定。',
    points: ['外指狀細胞 / 狄特氏細胞（Deiters cell）：托住外毛細胞，指突填補毛細胞之間的空隙', '內指狀細胞：支持內毛細胞', '漢生細胞（Hensen cell）：位於外毛細胞外側，負責離子代謝', '克勞蒂氏細胞（Claudius cell）：以緊密連結防止內淋巴流向螺旋韌帶', '網狀板：毛細胞與支持細胞頂部形成緊密連接，區隔內淋巴與柯地氏器']
  },
  stria: {
    zh: '血管紋', en: 'Stria vascularis', cat: '耳蝸剖面',
    func: '位於中階外側壁的網狀微血管組織，分泌鉀離子、產生內淋巴電位（約 +80 mV），維持內淋巴的電化學特性。',
    points: ['三層細胞：邊緣細胞（朝向中階，分泌鉀離子）、中間細胞、基底細胞（扁平，與螺旋韌帶相隔）', '血液來源：基底動脈 → 前下小腦動脈 → 迷路動脈 → 耳蝸總動脈 → 螺旋蝸軸動脈'],
    clinical: '血管紋萎縮造成代謝性老年聽損，聽力圖多呈平坦型。'
  },
  spiral_ligament: {
    zh: '螺旋韌帶', en: 'Spiral ligament', cat: '耳蝸剖面',
    func: '耳蝸外側壁的結締組織，固定基底膜外緣，並參與鉀離子回收循環。',
    points: ['纖維細胞把鉀離子送回血管紋', '基底膜張力的錨定點']
  },
  spiral_limbus: {
    zh: '螺旋緣', en: 'Spiral limbus', cat: '耳蝸剖面',
    func: '位於骨性螺旋板上方的結締組織隆起，是覆膜的內側附著處（強健連接在其上唇）。',
    points: ['也是 Reissner 氏膜的內側起點']
  },
  osseous_lamina: {
    zh: '骨性螺旋板', en: 'Osseous spiral lamina', cat: '耳蝸剖面',
    func: '從蝸軸伸出的骨性架子，基底膜的內緣附著在它上面；聽神經纖維從這裡穿過（穿孔小帶）到達毛細胞。',
    points: ['螺旋神經節位於蝸軸與骨性螺旋板的根部', '神經纖維進入基底膜區域後失去髓鞘']
  },
  an_fibers: {
    zh: '聽神經纖維（傳入）', en: 'Afferent auditory nerve fibers', cat: '耳蝸剖面・神經',
    func: '把毛細胞的訊息傳到螺旋神經節，再由聽神經送往腦幹。',
    points: ['內放射纖維：第一型神經元的樹突，直接連接內毛細胞（約 28,000 條）', '外螺旋纖維：第二型神經元，跨過柯地氏管後沿基底膜向基部走，分支連接多個外毛細胞（約 2,500–3,000 條）', '傳入突觸以麩胺酸（glutamate）為神經傳導物質'],
    tools: [['rate-level function', '/cochlear']]
  },
  olivocochlear: {
    zh: '橄欖耳蝸束（傳出）', en: 'Olivocochlear bundle (efferent)', cat: '傳出神經',
    func: '從腦幹上橄欖複合體回到耳蝸的下行路徑，調控耳蝸的敏感度。',
    points: ['內側橄欖耳蝸束（MOC）：起於上橄欖內側，大多交叉到對側，直接接觸外毛細胞，降低耳蝸放大器增益', '外側橄欖耳蝸束（LOC）：起於外側上橄欖，多為同側，接觸內毛細胞下方的第一型纖維', '傳出突觸以乙醯膽鹼（ACh）為主', '傳出神經密度：外毛細胞 > 內毛細胞；基部 > 頂部；第一排外毛細胞 > 第三排', '功能：噪音中抗遮蔽、保護耳蝸、選擇性注意'],
    clinical: '對側噪音刺激會降低 OAE 振幅（對側抑制），可用來評估 MOC 功能。',
    tools: [['雙音抑制與對側抑制', '/two_tone']]
  },

  // ───────────── 中樞聽覺路徑 ─────────────
  cn: {
    zh: '耳蝸神經核', en: 'Cochlear nucleus (CN)', cat: '中樞・延腦橋腦交界', members: ['avcn', 'pvcn', 'dcn'],
    func: '中樞聽覺路徑的第一站：所有聽神經纖維都在同側耳蝸神經核形成突觸（二級神經元細胞本體在此）。',
    points: ['位於低橋腦外側面（延腦與橋腦交界的背外側）', '分三區：前腹側（AVCN）、後腹側（PVCN）、背側（DCN）', '每一區都保有音調排列（tonotopy）', '耳蝸神經核以上的傳導大多交叉到對側，也有同側'],
    clinical: '耳蝸神經核以上的單側病變很少造成單側純音聽損，因為訊息已經雙側傳遞。',
    abr: 'ABR 波 III（耳蝸神經核附近）'
  },
  avcn: {
    zh: '前腹側耳蝸神經核（AVCN）', en: 'Anteroventral cochlear nucleus', cat: '中樞・耳蝸神經核',
    func: '以叢狀細胞（bushy cell）精確保留時間與相位訊息，送往兩側上橄欖複合體做聲源定位。',
    points: ['經腹側聽覺紋（ventral acoustic stria）通過斜方體，大多進入對側上橄欖複合體', '同時也投射到同側上橄欖', 'Held 氏萼（calyx of Held）大型突觸位於對側 MNTB']
  },
  pvcn: {
    zh: '後腹側耳蝸神經核（PVCN）', en: 'Posteroventral cochlear nucleus', cat: '中樞・耳蝸神經核',
    func: '章魚細胞（octopus cell）對聲音起始（onset）非常敏感，整合大量聽神經纖維的時間訊息。',
    points: ['經中間聽覺紋（intermediate acoustic stria）投射到對側外側丘系', '也接受下行（傳出）路徑的輸入']
  },
  dcn: {
    zh: '背側耳蝸神經核（DCN）', en: 'Dorsal cochlear nucleus', cat: '中樞・耳蝸神經核',
    func: '梭狀細胞（fusiform cell）分析頻譜特徵（例如耳廓造成的頻譜凹陷），協助垂直方向定位，也整合頭頸部體感訊息。',
    points: ['經背側聽覺紋（dorsal acoustic stria）直接投射到對側外側丘系與下丘', '有複雜的抑制性中間神經元網路'],
    clinical: 'DCN 過度活化被認為與耳鳴有關。'
  },
  soc: {
    zh: '上橄欖複合體', en: 'Superior olivary complex (SOC)', cat: '中樞・橋腦', members: ['mso', 'lso', 'mntb'],
    func: '第一個接收兩耳輸入的地方：比較兩耳的時間差與強度差來定位聲源；也是聽反射與橄欖耳蝸束的起點。',
    points: ['主要核團：內側上橄欖（MSO）、外側上橄欖（LSO）、斜方體內側核（MNTB）', '雙耳時間差（ITD）→ 低頻定位；雙耳強度差（ILD）→ 高頻定位', '輸出經外側丘系上行'],
    abr: 'ABR 波 III–IV'
  },
  mso: {
    zh: '內側上橄欖（MSO）', en: 'Medial superior olive', cat: '中樞・上橄欖複合體',
    func: '巧合偵測器：同時接收兩耳興奮性輸入，偵測微秒級的雙耳時間差（ITD），主要負責低頻聲源定位。',
    points: ['類似 Jeffress 延遲線模型', '人類 MSO 相對較大，與低頻語音、定位有關']
  },
  lso: {
    zh: '外側上橄欖（LSO）', en: 'Lateral superior olive', cat: '中樞・上橄欖複合體',
    func: '比較同側興奮與對側抑制（經 MNTB）的強弱，計算雙耳強度差（ILD），主要負責高頻聲源定位。',
    points: ['高頻聲音被頭部遮蔽，形成頭影效應，使兩耳強度不同', '外側橄欖耳蝸束（LOC）多由此發出']
  },
  mntb: {
    zh: '斜方體內側核（MNTB）', en: 'Medial nucleus of the trapezoid body', cat: '中樞・上橄欖複合體',
    func: '把對側 AVCN 的興奮訊號快速轉成甘胺酸（glycine）抑制訊號送給 LSO，是 ILD 計算的關鍵。',
    points: ['接受 Held 氏萼大型突觸，傳遞非常快速可靠']
  },
  trapezoid: {
    zh: '斜方體（腹側聽覺紋）', en: 'Trapezoid body / ventral acoustic stria', cat: '中樞・交叉纖維',
    func: '橋腦腹側的橫向交叉纖維束，把耳蝸神經核（主要是 AVCN）的訊息送到對側上橄欖複合體。',
    points: ['是聽覺路徑最主要的交叉點', '讓兩耳訊息在腦幹低位就開始整合']
  },
  das: {
    zh: '背側聽覺紋', en: 'Dorsal acoustic stria', cat: '中樞・交叉纖維',
    func: 'DCN 的輸出經腦幹背側交叉，不經上橄欖，直接加入對側外側丘系上行到下丘。',
    points: ['與中間聽覺紋（PVCN）同屬繞過上橄欖的路徑']
  },
  ll: {
    zh: '外側丘系', en: 'Lateral lemniscus', cat: '中樞・橋腦到中腦',
    func: '聽覺主要的上行神經束，把耳蝸神經核與上橄欖複合體的訊息送到下丘。',
    points: ['同時攜帶來自兩側的訊息（對側較多）', '沿途有外側丘系核'],
    abr: 'ABR 波 IV–V（波 V 主要與外側丘系終止於下丘處有關）'
  },
  nll: {
    zh: '外側丘系核', en: 'Nuclei of the lateral lemniscus', cat: '中樞・橋腦',
    func: '位於外側丘系上的中繼核，處理時間訊息與抑制性調控。',
    points: ['腹側核（VNLL）：對聲音起始反應精確，處理時間模式', '背側核（DNLL）：GABA 抑制性，經 Probst 連合投射到兩側下丘，參與回聲抑制（優先效應）']
  },
  ic: {
    zh: '下丘', en: 'Inferior colliculus (IC)', cat: '中樞・中腦',
    func: '中腦的聽覺整合中樞，幾乎所有上行聽覺路徑都在此中繼；整合雙耳時間差、強度差與頻譜線索，形成聲音空間訊息。',
    points: ['中央核有層狀的音調排列', '外殼與背側皮質接受多感覺與下行輸入', '經下丘連合與對側下丘交換訊息', '投射到上丘，參與轉頭朝向聲源的反射'],
    abr: 'ABR 波 V（外側丘系進入下丘處）'
  },
  bic: {
    zh: '下丘臂', en: 'Brachium of the inferior colliculus', cat: '中樞・中腦到視丘',
    func: '從下丘通往內側膝狀體的纖維束。',
    points: ['位於中腦背外側表面，可在腦幹表面看到']
  },
  sc: {
    zh: '上丘', en: 'Superior colliculus', cat: '中樞・中腦（非主要聽覺路徑）',
    func: '主要是視覺反射中樞，但也接收下丘的聽覺空間訊息，整合視聽，讓眼睛與頭轉向聲源。',
    points: ['深層有視、聽、體感對齊的空間地圖']
  },
  mgb: {
    zh: '內側膝狀體', en: 'Medial geniculate body (MGB)', cat: '中樞・視丘',
    func: '視丘的聽覺中繼站，把下丘的訊息整理後經聽輻射送到聽覺皮質，並參與注意力與情緒相關的聽覺處理。',
    points: ['腹側部：音調排列清楚，投射到初級聽覺皮質（主要路徑）', '背側部與內側部：多感覺、與杏仁核連結，和聽覺情緒、學習有關'],
    abr: '中潛時反應 MLR（部分）'
  },
  thalamus: {
    zh: '視丘', en: 'Thalamus', cat: '中樞・間腦',
    func: '大部分感覺訊息進入大腦皮質前的中繼站；聽覺的部分是位於視丘後下方的內側膝狀體。',
    points: ['視覺中繼在外側膝狀體，聽覺中繼在內側膝狀體']
  },
  radiation: {
    zh: '聽輻射', en: 'Acoustic (auditory) radiation', cat: '中樞・白質',
    func: '從內側膝狀體經內囊後肢（豆狀核下部）投射到顳葉聽覺皮質的纖維。',
    points: ['保有音調排列']
  },
  a1: {
    zh: '初級聽覺皮質（Heschl 氏回）', en: 'Primary auditory cortex (A1)', cat: '中樞・大腦皮質',
    func: '大腦對聲音的第一層皮質處理：音高、強度、時間變化的基本分析，具音調排列（模型顏色：藍＝低頻、紅＝高頻）。',
    points: ['位於顳上回上表面的橫顳回（Heschl 氏回），Brodmann 41 區', '低頻在前外側、高頻在後內側', '每側皮質都接受兩耳輸入，對側較強'],
    clinical: '單側皮質病變通常不影響純音閾值，需用雙耳分聽等中樞聽覺處理測驗評估；兩側受損可能造成皮質聾。',
    abr: '中潛時反應 MLR（Pa）、晚期皮質反應 P1–N1–P2'
  },
  stg_post: {
    zh: '顳上回後部（聽覺聯合皮質）', en: 'Posterior superior temporal gyrus', cat: '中樞・大腦皮質',
    func: '包含初級聽覺皮質周圍的帶狀區與旁帶區（Brodmann 42、22 區）與顳平面，負責複雜聲音、語音與音樂的分析。',
    points: ['顳平面在多數人左側較大，與語言有關', '「What」路徑往前（辨識聲音），「Where」路徑往後上（定位聲音）', '左側後部包含 Wernicke 區']
  },
  stg_ant: {
    zh: '顳上回前部', en: 'Anterior superior temporal gyrus', cat: '中樞・大腦皮質',
    func: '屬聽覺腹側（What）路徑，參與辨識聲音身分、語音與語句理解。',
    points: ['與顳極、額葉下部連結']
  },
  wernicke: {
    zh: 'Wernicke 區', en: 'Wernicke area', cat: '中樞・語言皮質',
    func: '位於優勢半球（多為左側）顳上回後部，負責語言理解，把聽到的語音對應到詞彙意義。',
    points: ['經弓狀束連到額葉 Broca 區（語言表達）'],
    clinical: 'Wernicke 失語症：說話流暢但內容空洞，理解差。'
  },
  corpus_callosum: {
    zh: '胼胝體', en: 'Corpus callosum', cat: '中樞・白質',
    func: '連接左右大腦半球的最大纖維束，讓兩側聽覺皮質交換訊息。',
    points: ['聽覺纖維主要經過胼胝體後段'],
    clinical: '雙耳分聽測驗中，左耳訊息需經胼胝體才能到左腦語言區，所以常見右耳優勢；胼胝體病變時左耳表現明顯下降。'
  },
  pons: {
    zh: '橋腦', en: 'Pons', cat: '中樞・腦幹',
    func: '腦幹中段，聽覺路徑的上橄欖複合體、斜方體、外側丘系都在這裡。',
    points: ['腹側隆起含大量橫向纖維，連接小腦']
  },
  medulla: {
    zh: '延腦', en: 'Medulla oblongata', cat: '中樞・腦幹',
    func: '腦幹最下段；耳蝸神經核位於延腦與橋腦交界處的背外側。',
    points: ['也包含呼吸、心跳等生命中樞，以及吞嚥、發聲相關的腦神經核（疑核、舌下神經核）']
  },
  cerebellum: {
    zh: '小腦', en: 'Cerebellum', cat: '中樞',
    func: '協調動作、平衡與言語動作的時序。',
    points: ['橋腦小腦角是聽神經瘤好發的位置'],
    clinical: '小腦病變可能造成運動失調型吶吃（說話節律不規則）。'
  },

  // ───────────── 口腔・咽・喉：喉軟骨 ─────────────
  thyroid_cart: {
    zh: '甲狀軟骨', en: 'Thyroid cartilage', cat: '喉・軟骨', sys: 'oral',
    func: '喉部最大的軟骨，像盾牌保護聲帶；聲帶前端附著在它內面的前角。',
    points: ['兩片板在前方相接形成喉結（男性夾角約 90°，女性約 120°）', '上角以甲狀舌骨韌帶連舌骨；下角與環狀軟骨形成環甲關節', '環甲肌讓甲狀軟骨對環狀軟骨前傾，拉長聲帶、提高音調'],
    clinical: '喉部外傷、甲狀軟骨成形術可調整音調。'
  },
  cricoid_cart: {
    zh: '環狀軟骨', en: 'Cricoid cartilage', cat: '喉・軟骨', sys: 'oral',
    func: '喉部唯一完整的軟骨環，是喉的基座；杓狀軟骨坐在它後上方的板上。',
    points: ['前窄後寬，像戒指（印戒）', '下接氣管', '與甲狀軟骨形成環甲關節、與杓狀軟骨形成環杓關節'],
    clinical: '緊急時可做環甲膜切開建立呼吸道。'
  },
  arytenoid_cart: {
    zh: '杓狀軟骨', en: 'Arytenoid cartilage', cat: '喉・軟骨', sys: 'oral',
    func: '一對錐形軟骨，聲帶後端附著在其聲帶突；杓狀軟骨在環杓關節上轉動、滑動，控制聲帶的開合。',
    points: ['聲帶突（向前）：聲帶韌帶附著處', '肌突（向外）：環杓後肌與環杓側肌附著處', '運動：搖擺（rocking）、滑動（gliding）、少量旋轉'],
    clinical: '插管可能造成杓狀軟骨脫位，影響聲帶閉合。'
  },
  corniculate_cart: {
    zh: '小角軟骨', en: 'Corniculate cartilage', cat: '喉・軟骨', sys: 'oral',
    func: '位於杓狀軟骨尖端的小軟骨，支撐杓會厭皺襞的後端。',
    points: ['彈性軟骨']
  },
  cuneiform_cart: {
    zh: '楔狀軟骨', en: 'Cuneiform cartilage', cat: '喉・軟骨', sys: 'oral',
    func: '埋在杓會厭皺襞內的小軟骨，增加皺襞的硬度。',
    points: ['彈性軟骨，不一定每個人都有']
  },
  epiglottis: {
    zh: '會厭軟骨', en: 'Epiglottis', cat: '喉・軟骨', sys: 'oral',
    func: '葉狀的彈性軟骨；吞嚥時隨喉上抬而向後下翻，蓋住喉口，引導食物進入食道。',
    points: ['以甲狀會厭韌帶連在甲狀軟骨內面，以舌骨會厭韌帶連舌骨', '會厭與舌根之間的凹陷為會厭谷（vallecula）'],
    clinical: '吞嚥障礙評估常觀察會厭谷殘留；急性會厭炎可能阻塞呼吸道。'
  },
  hyoid: {
    zh: '舌骨', en: 'Hyoid bone', cat: '骨骼', sys: 'oral',
    func: '人體唯一不與其他骨頭形成關節的骨頭，懸吊在下頷與喉之間，是舌、舌骨上肌群與舌骨下肌群的附著點。',
    points: ['構造：舌骨體、大角、小角', '吞嚥時舌骨向前上移動，帶動喉上抬、打開食道上括約肌'],
    clinical: '吞嚥攝影檢查常以舌骨位移評估吞嚥功能。'
  },
  vocal_lig: {
    zh: '聲帶韌帶', en: 'Vocal ligament', cat: '喉・韌帶', sys: 'oral',
    func: '彈性圓錐的上緣增厚部分，從甲狀軟骨前角延伸到杓狀軟骨聲帶突，構成聲帶的中層與深層。',
    points: ['聲帶分層（body-cover 理論）：上皮與固有層淺層（Reinke 氏間隙）為 cover；中層、深層與甲杓肌為 body', '聲帶振動主要發生在 cover 層'],
    clinical: '聲帶結節、息肉、Reinke 氏水腫都發生在 cover 層。'
  },
  vocalis: {
    zh: '聲帶肌', en: 'Vocalis', cat: '喉・內在肌', sys: 'oral',
    func: '甲杓肌最內側的部分，緊貼聲帶韌帶；收縮時調整聲帶的張力與厚度，微調音調。',
    points: ['迷走神經的喉返神經支配', '屬於聲帶的 body']
  },
  thyroarytenoid: {
    zh: '甲杓肌', en: 'Thyroarytenoid', cat: '喉・內在肌', sys: 'oral',
    func: '構成聲帶主體；收縮時縮短、放鬆聲帶並使聲帶變厚，降低音調，也幫助聲帶內收。',
    points: ['起於甲狀軟骨內面，止於杓狀軟骨', '喉返神經支配', '與環甲肌互相拮抗調控音調']
  },
  pca: {
    zh: '環杓後肌', en: 'Posterior cricoarytenoid', cat: '喉・內在肌', sys: 'oral',
    func: '唯一使聲帶外展（打開聲門）的肌肉，吸氣時把杓狀軟骨肌突往後內拉。',
    points: ['喉返神經支配'],
    clinical: '兩側喉返神經麻痺時聲帶無法外展，可能造成呼吸困難。'
  },
  lca: {
    zh: '環杓側肌', en: 'Lateral cricoarytenoid', cat: '喉・內在肌', sys: 'oral',
    func: '把杓狀軟骨肌突往前拉，使聲帶突向內轉，內收聲帶（閉合聲門膜部）。',
    points: ['喉返神經支配', '與環杓後肌拮抗']
  },
  ia: {
    zh: '杓間肌（橫杓肌＋斜杓肌）', en: 'Interarytenoid (transverse & oblique)', cat: '喉・內在肌', sys: 'oral',
    func: '把兩側杓狀軟骨拉近，閉合聲門後部（軟骨部）。',
    points: ['唯一不成對的喉內在肌（橫杓肌）', '喉返神經支配（兩側共同支配）', '斜杓肌往上延續為杓會厭肌'],
    clinical: '杓間肌無力時聲門後部有縫隙，聲音帶氣息聲。'
  },
  aryepiglotticus: {
    zh: '杓會厭肌', en: 'Aryepiglotticus', cat: '喉・內在肌', sys: 'oral',
    func: '位於杓會厭皺襞內，收縮時縮小喉口，吞嚥時協助保護呼吸道。',
    points: ['為斜杓肌的延續']
  },
  cricothyroid: {
    zh: '環甲肌', en: 'Cricothyroid', cat: '喉・內在肌', sys: 'oral',
    func: '使甲狀軟骨對環狀軟骨前傾，拉長並繃緊聲帶，是提高音調的主要肌肉。',
    points: ['唯一由喉上神經外枝支配的喉內在肌', '分直部與斜部'],
    clinical: '喉上神經受損時高音困難、音域變窄、聲音容易疲勞。'
  },
  cricothyroid_lig: {
    zh: '環甲韌帶（彈性圓錐）', en: 'Median cricothyroid ligament', cat: '喉・韌帶', sys: 'oral',
    func: '連接環狀軟骨與甲狀軟骨的彈性膜，向上延續為聲帶韌帶。',
    points: ['臨床緊急呼吸道（環甲膜切開）的位置']
  },
  thyrohyoid_mem: {
    zh: '甲狀舌骨膜', en: 'Thyrohyoid membrane', cat: '喉・韌帶', sys: 'oral',
    func: '把喉懸吊在舌骨下方，吞嚥時舌骨上抬會帶動喉一起上抬。',
    points: ['喉上神經內枝與喉上動脈從膜上穿入']
  },
  epiglottic_lig: {
    zh: '會厭韌帶（舌骨會厭、甲狀會厭）', en: 'Hyoepiglottic & thyroepiglottic ligaments', cat: '喉・韌帶', sys: 'oral',
    func: '把會厭固定在舌骨與甲狀軟骨上，吞嚥時讓會厭能翻轉。',
    points: []
  },
  // ───────────── 咽 ─────────────
  spc: {
    zh: '咽上縮肌', en: 'Superior pharyngeal constrictor', cat: '咽・肌肉', sys: 'oral',
    func: '吞嚥時由上往下依序收縮推送食團；與軟腭一起關閉鼻咽（腭咽閉合時形成 Passavant 嵴）。',
    points: ['迷走神經咽叢支配', '起於翼突鉤、翼下頷縫、下頷骨', '後方止於咽縫'],
    clinical: '腭咽閉合不全會造成鼻音過重、鼻漏氣。'
  },
  mpc: {
    zh: '咽中縮肌', en: 'Middle pharyngeal constrictor', cat: '咽・肌肉', sys: 'oral',
    func: '吞嚥咽期的蠕動收縮，把食團往下推。',
    points: ['起於舌骨大角、小角與莖舌骨韌帶', '迷走神經咽叢支配']
  },
  ipc: {
    zh: '咽下縮肌', en: 'Inferior pharyngeal constrictor', cat: '咽・肌肉', sys: 'oral',
    func: '最厚的咽縮肌；下部的環咽肌即食道上括約肌，平時收縮、吞嚥時放鬆讓食團進入食道。',
    points: ['甲咽部起於甲狀軟骨，環咽部起於環狀軟骨', '甲咽部與環咽部之間的薄弱區（Killian 三角）'],
    clinical: '環咽肌無法放鬆造成吞嚥困難；Killian 三角是 Zenker 憩室的好發處。'
  },
  pharyngeal_raphe: {
    zh: '咽縫', en: 'Pharyngeal raphe', cat: '咽・結締組織', sys: 'oral',
    func: '咽後壁正中的纖維帶，三塊咽縮肌在此交會附著。',
    points: ['上端附著於顱底的咽結節']
  },
  stylopharyngeus: {
    zh: '莖突咽肌', en: 'Stylopharyngeus', cat: '咽・肌肉', sys: 'oral',
    func: '吞嚥與發聲時上提並擴大咽與喉。',
    points: ['唯一由舌咽神經（CN IX）支配的肌肉']
  },
  salpingopharyngeus: {
    zh: '耳咽管咽肌', en: 'Salpingopharyngeus', cat: '咽・肌肉', sys: 'oral',
    func: '上提咽側壁，吞嚥時協助打開耳咽管。',
    points: ['起於耳咽管軟骨', '迷走神經咽叢支配']
  },
  palatopharyngeus: {
    zh: '腭咽肌', en: 'Palatopharyngeus', cat: '咽・軟腭肌', sys: 'oral',
    func: '構成腭咽弓（後柱）；收縮時拉近腭咽弓、上提咽喉，協助腭咽閉合與吞嚥。',
    points: ['迷走神經咽叢支配']
  },
  lvp: {
    zh: '腭帆提肌', en: 'Levator veli palatini', cat: '咽・軟腭肌', sys: 'oral',
    func: '腭咽閉合最主要的肌肉，把軟腭往後上提，關閉鼻咽，讓非鼻音能產生口腔壓力。',
    points: ['兩側肌肉在軟腭中段形成肌肉吊帶（levator sling）', '迷走神經咽叢支配'],
    clinical: '腭裂時腭帆提肌附著異常，造成鼻音過重與代償性構音。'
  },
  tvp: {
    zh: '腭帆張肌', en: 'Tensor veli palatini', cat: '咽・軟腭肌', sys: 'oral',
    func: '繃緊軟腭前部，並在吞嚥、打哈欠時打開耳咽管。',
    points: ['唯一由三叉神經（CN V）支配的軟腭肌', '肌腱繞過翼突鉤'],
    clinical: '功能不良使耳咽管無法打開，是腭裂兒童中耳積液的原因。'
  },
  uvulae: {
    zh: '懸雍垂肌', en: 'Musculus uvulae', cat: '咽・軟腭肌', sys: 'oral',
    func: '使懸雍垂縮短上提，增加軟腭背側的厚度，幫助腭咽閉合。',
    points: ['迷走神經咽叢支配'],
    clinical: '黏膜下腭裂常見懸雍垂分叉。'
  },
  // ───────────── 舌與口腔 ─────────────
  tongue: {
    zh: '舌', en: 'Tongue', cat: '口腔', sys: 'oral',
    func: '最重要的構音器官，改變口腔形狀產生不同母音與子音；也負責咀嚼時攪拌食物與推送食團。',
    points: ['分為舌尖、舌葉、舌背、舌根', '內在肌（上縱、下縱、橫、垂直肌）改變舌的形狀', '外在肌（頦舌肌、舌骨舌肌、莖突舌肌、腭舌肌）改變舌的位置', '除腭舌肌（迷走神經）外都由舌下神經（CN XII）支配'],
    clinical: '舌下神經麻痺時伸舌偏向患側；舌繫帶過短可能影響捲舌音。',
    tools: [['發音互動教室', '/phonetics'], ['母音特性', '/vowels']]
  },
  genioglossus: {
    zh: '頦舌肌', en: 'Genioglossus', cat: '舌・外在肌', sys: 'oral',
    func: '最大的舌外在肌，扇形從下頷骨頦棘伸入舌內；收縮時把舌往前伸出、壓低舌中部。',
    points: ['舌下神經支配', '維持呼吸道暢通，睡眠時張力下降可能造成阻塞'],
    clinical: '阻塞型睡眠呼吸中止症與頦舌肌張力有關。'
  },
  hyoglossus: {
    zh: '舌骨舌肌', en: 'Hyoglossus', cat: '舌・外在肌', sys: 'oral',
    func: '從舌骨往上伸入舌側，收縮時壓低並後縮舌頭。',
    points: ['舌下神經支配']
  },
  // ───────────── 舌骨上、下肌群 ─────────────
  digastric: {
    zh: '二腹肌', en: 'Digastric', cat: '舌骨上肌群', sys: 'oral',
    func: '前腹與後腹以中間腱連在舌骨上；可上提舌骨，或在舌骨固定時拉下下頷（張口）。',
    points: ['前腹：三叉神經（下齒槽神經的下頷舌骨肌支）支配', '後腹：顏面神經支配']
  },
  mylohyoid: {
    zh: '下頷舌骨肌', en: 'Mylohyoid', cat: '舌骨上肌群', sys: 'oral',
    func: '構成口腔底部的肌肉膜，吞嚥時上提口底與舌骨，把舌往上推向硬腭。',
    points: ['三叉神經（下頷舌骨肌神經）支配']
  },
  geniohyoid: {
    zh: '頦舌骨肌', en: 'Geniohyoid', cat: '舌骨上肌群', sys: 'oral',
    func: '把舌骨往前上拉，吞嚥時協助打開食道上括約肌。',
    points: ['由第 1 頸神經（經舌下神經走行）支配']
  },
  stylohyoid: {
    zh: '莖突舌骨肌', en: 'Stylohyoid', cat: '舌骨上肌群', sys: 'oral',
    func: '把舌骨往後上拉，拉長口底。',
    points: ['顏面神經支配']
  },
  sternohyoid: {
    zh: '胸骨舌骨肌', en: 'Sternohyoid', cat: '舌骨下肌群', sys: 'oral',
    func: '吞嚥後把舌骨與喉拉回下方；說話時協助降低喉位。',
    points: ['頸袢（C1–C3）支配']
  },
  sternothyroid: {
    zh: '胸骨甲狀肌', en: 'Sternothyroid', cat: '舌骨下肌群', sys: 'oral',
    func: '把甲狀軟骨往下拉，降低喉位，可能影響低音。',
    points: ['頸袢支配']
  },
  thyrohyoid: {
    zh: '甲狀舌骨肌', en: 'Thyrohyoid', cat: '舌骨下肌群', sys: 'oral',
    func: '舌骨固定時上提喉；喉固定時下拉舌骨。吞嚥時拉近舌骨與甲狀軟骨。',
    points: ['由第 1 頸神經（經舌下神經走行）支配']
  },
  omohyoid: {
    zh: '肩胛舌骨肌', en: 'Omohyoid', cat: '舌骨下肌群', sys: 'oral',
    func: '下拉並固定舌骨。',
    points: ['上腹與下腹以中間腱相連', '頸袢支配']
  },
  stylohyoid_lig: {
    zh: '莖突舌骨韌帶', en: 'Stylohyoid ligament', cat: '韌帶', sys: 'oral',
    func: '從顳骨莖突連到舌骨小角，懸吊舌骨。',
    points: ['鈣化時稱 Eagle 症候群']
  },
  stylomandibular_lig: {
    zh: '莖突下頷韌帶', en: 'Stylomandibular ligament', cat: '韌帶', sys: 'oral',
    func: '從莖突連到下頷角，限制下頷過度前伸。',
    points: []
  },
  // ───────────── 骨骼與牙齒 ─────────────
  mandible: {
    zh: '下頷骨', en: 'Mandible', cat: '骨骼', sys: 'oral',
    func: '唯一能活動的顱骨，經顳顎關節開合與前後左右移動；承載下排牙齒，是許多構音與咀嚼肌的附著處。',
    points: ['構造：下頷體、下頷枝、髁突、冠狀突、下頷角', '說話時下頷高度影響母音的開口度'],
    clinical: '顳顎關節障礙可能影響張口與構音。'
  },
  maxilla: {
    zh: '上頷骨', en: 'Maxilla', cat: '骨骼', sys: 'oral',
    func: '構成上顎、硬腭前 3/4、鼻腔外側壁與眼眶底部；承載上排牙齒。',
    points: ['齒槽嵴是舌尖音（ㄉㄊㄋㄌ）的構音位置', '腭突構成硬腭前部'],
    clinical: '唇腭裂與上頷骨發育不全常需要齒顎矯正。'
  },
  palatine: {
    zh: '腭骨', en: 'Palatine bone', cat: '骨骼', sys: 'oral',
    func: '水平板構成硬腭後 1/4，軟腭的腭腱膜附著在其後緣。',
    points: ['硬腭是舌面音、捲舌音的構音接觸面']
  },
  sphenoid: {
    zh: '蝶骨', en: 'Sphenoid bone', cat: '骨骼', sys: 'oral',
    func: '顱底中央的蝴蝶形骨頭；翼突是咽上縮肌、腭帆張肌與翼肌的附著處。',
    points: ['翼突鉤讓腭帆張肌肌腱轉向']
  },
  vomer: { zh: '犁骨', en: 'Vomer', cat: '骨骼', sys: 'oral', func: '構成鼻中隔後下部，分隔左右鼻腔。', points: [] },
  ethmoid: { zh: '篩骨垂直板', en: 'Perpendicular plate of ethmoid', cat: '骨骼', sys: 'oral', func: '構成鼻中隔上部。', points: [] },
  concha: { zh: '下鼻甲', en: 'Inferior nasal concha', cat: '鼻腔', sys: 'oral', func: '增加鼻腔表面積，加溫加濕吸入的空氣；影響鼻腔共鳴。', points: ['鼻甲肥大會造成鼻音不足（閉塞性鼻音）'] },
  nasal_bone: { zh: '鼻骨', en: 'Nasal bone', cat: '骨骼', sys: 'oral', func: '構成鼻樑上部。', points: [] },
  nasal_cart: { zh: '鼻外側軟骨', en: 'Lateral nasal cartilage', cat: '鼻・軟骨', sys: 'oral', func: '支撐鼻樑下半部的外形。', points: [] },
  zygomatic: { zh: '顴骨', en: 'Zygomatic bone', cat: '骨骼', sys: 'oral', func: '構成臉頰的隆起與眼眶外側壁，咬肌起點。', points: [] },
  occipital: { zh: '枕骨', en: 'Occipital bone', cat: '骨骼', sys: 'oral', func: '構成顱底後部；咽縫上端附著於其咽結節。', points: ['枕骨大孔讓延腦通過'] },
  cervical: { zh: '頸椎', en: 'Cervical vertebrae', cat: '骨骼', sys: 'oral', func: '支撐頭頸部；咽後壁與食道緊貼在頸椎前方。', points: ['共 7 節；第 1 節寰椎、第 2 節軸椎', '喉約位於第 3–6 頸椎高度'] },
  disc: { zh: '椎間盤', en: 'Intervertebral disc', cat: '骨骼', sys: 'oral', func: '頸椎之間的緩衝墊。', points: [] },
  incisor: { zh: '門齒', en: 'Incisors', cat: '牙齒', sys: 'oral', func: '切斷食物；上門齒是唇齒音（ㄈ /f/）與齒間音的構音接觸點。', points: ['上下各 4 顆'], clinical: '門齒缺失或咬合不正（開咬）會影響 ㄙ、ㄈ 等擦音。' },
  canine: { zh: '犬齒', en: 'Canines', cat: '牙齒', sys: 'oral', func: '撕裂食物。', points: ['上下各 2 顆'] },
  premolar: { zh: '小臼齒', en: 'Premolars', cat: '牙齒', sys: 'oral', func: '壓碎與磨碎食物。', points: ['上下各 4 顆'] },
  molar: { zh: '大臼齒', en: 'Molars', cat: '牙齒', sys: 'oral', func: '研磨食物；舌側緣靠在上臼齒形成側向封閉，是許多舌音的構音條件。', points: ['模型為第一、第二大臼齒'] },
  gingiva: { zh: '牙齦', en: 'Gingiva', cat: '口腔', sys: 'oral', func: '包覆齒槽骨與牙頸部的黏膜。', points: [] },
  lip: { zh: '嘴唇', en: 'Lips', cat: '口腔', sys: 'oral', func: '雙唇音（ㄅㄆㄇ）與唇齒音的構音器官，圓唇與展唇改變母音音色。', points: ['主要由口輪匝肌構成，顏面神經支配'], clinical: '唇裂、顏面神經麻痺會影響雙唇音。', tools: [['發音互動教室', '/phonetics']] },
  // ───────────── 呼吸與消化道 ─────────────
  trachea: { zh: '氣管', en: 'Trachea', cat: '呼吸道', sys: 'oral', func: '把空氣送進肺；呼氣氣流是發聲的動力來源。', points: ['由 16–20 個 C 形軟骨環構成，後方為平滑肌', '上接環狀軟骨'], clinical: '氣切後氣流不經聲門，需使用說話瓣膜才能發聲。' },
  esophagus: { zh: '食道', en: 'Esophagus', cat: '消化道', sys: 'oral', func: '把食團從咽送到胃；上端以環咽肌（食道上括約肌）與咽相接。', points: ['位於氣管後方'] },
  // ───────────── 神經 ─────────────
  vagus: { zh: '迷走神經（第 10 對腦神經）', en: 'Vagus nerve (CN X)', cat: '神經', sys: 'oral', func: '支配咽、軟腭（腭帆張肌除外）與全部喉肌，是發聲與吞嚥最重要的腦神經。', points: ['咽枝：咽縮肌與軟腭肌', '喉上神經：外枝支配環甲肌，內枝負責聲門以上的感覺', '喉返神經：其餘喉內在肌與聲門以下的感覺'], clinical: '迷走神經損傷造成聲帶麻痺、鼻音過重與吞嚥障礙。' },
  rln: { zh: '喉返神經', en: 'Recurrent laryngeal nerve', cat: '神經', sys: 'oral', func: '支配環甲肌以外的所有喉內在肌（聲帶開合），以及聲門以下的感覺。', points: ['左側繞過主動脈弓、右側繞過鎖骨下動脈後上行，左側較長'], clinical: '甲狀腺手術、胸腔腫瘤可能傷及喉返神經，造成單側聲帶麻痺與氣息聲；左側較常受損。' },
  hypoglossal: { zh: '舌下神經（第 12 對腦神經）', en: 'Hypoglossal nerve (CN XII)', cat: '神經', sys: 'oral', func: '支配舌的內在肌與大部分外在肌（腭舌肌除外）。', points: [], clinical: '單側麻痺時伸舌偏向患側，並出現舌肌萎縮。' }
};

// 聽覺訊息上行順序（用於「上一站 / 下一站」）
export const PATHWAY = ['pinna', 'ear_canal', 'tm', 'malleus', 'incus', 'stapes', 'oval_window', 'cochlea', 'basilar', 'ihc', 'an_fibers', 'spiral_ganglion', 'cn8', 'cn', 'trapezoid', 'soc', 'll', 'ic', 'bic', 'mgb', 'radiation', 'a1', 'stg_post'];
