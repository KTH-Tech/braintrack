/**
 * Task #617 — Rich worked examples for the 24 remaining non-STEM Grade 12 subjects.
 * Provides workedExamplesEn and workedExamplesAf (3 examples each) for every topic
 * in: ENGH, AFRH, MATL, ACC, BUS, ECO, GEO, HIS, ENGF, AFRF, IT, CAT, EGD, AGR,
 *     CON, TOUR, ART, TMATH, TSCI, RELI, DRAMA, DANCE, MUSIC, DESIGN.
 *
 * Imported by scripts/seed-topic-content.ts and merged into TOPIC_CONTENT.
 */

export type WorkedExample = {
  question: string;
  steps: string[];
  solution: string;
  commonErrors: string[];
};

export type NonStemWorkedExamples = {
  workedExamplesEn: WorkedExample[];
  workedExamplesAf: WorkedExample[];
};

export const NON_STEM_WORKED_EXAMPLES: Record<string, NonStemWorkedExamples> = {

  // ===================== ENGLISH HOME LANGUAGE (ENGH) =====================

  "ENGH-1": {
    workedExamplesEn: [
      {
        question: "Write a PEEL paragraph discussing how setting shapes the protagonist's behaviour in the prescribed novel.",
        steps: [
          "Point: state a clear topic sentence that links setting directly to behaviour.",
          "Evidence: quote or closely reference a specific scene where the setting is described.",
          "Explain: show how the details of the setting (e.g. isolation, heat, poverty) cause or constrain the character's choices.",
          "Link: connect back to the theme or the question to close the paragraph."
        ],
        solution: "Point: The oppressive rural setting in the novel limits the protagonist's ability to escape her abusive relationship. Evidence: The author describes a farm 'surrounded by nothing but dust and silence for fifty kilometres in every direction'. Explain: This physical isolation removes practical options — no transport, no neighbours, no refuge — forcing her to confront her abuser directly. Link: Setting therefore becomes an instrument of entrapment that drives the central conflict.",
        commonErrors: [
          "Retelling the plot instead of analysing how setting causes behaviour.",
          "Leaving out the 'Explain' step — listing a quote is not analysis.",
          "Making the link too vague ('this shows the theme of the novel') without naming the specific theme."
        ]
      },
      {
        question: "Identify and explain the use of an unreliable narrator in a novel extract, giving two textual examples.",
        steps: [
          "Define unreliable narrator briefly: a first-person voice whose account cannot be fully trusted.",
          "Find the first example: look for contradictions, exaggerations, or self-justifications.",
          "Find the second example: look for moments where other characters' reactions contradict the narrator's self-image.",
          "Explain the author's purpose in choosing this narrative technique."
        ],
        solution: "An unreliable narrator is a first-person voice whose version of events is distorted by bias or limited knowledge. Example 1: The narrator claims 'everyone respected me at school' yet the extract shows classmates mocking him — his self-image is contradicted by the evidence. Example 2: He describes his mother's silence as 'peaceful understanding' when her body language (tears, averted eyes) suggests pain — he misreads people around him. The author uses unreliability to force readers to think critically and discover a deeper truth behind the surface account.",
        commonErrors: [
          "Confusing third-person limited with an unreliable narrator — unreliability is specific to first-person accounts.",
          "Only identifying one example when two are asked for.",
          "Forgetting to discuss the author's purpose — analysis requires 'why', not just 'what'."
        ]
      },
      {
        question: "Compare the treatment of the theme of justice in the prescribed novel using evidence from two different chapters.",
        steps: [
          "Define how justice is presented early in the novel (Chapter or event 1).",
          "Define how justice is presented later (Chapter or event 2) — show development or contrast.",
          "Use textual evidence (quote or close reference) for each chapter.",
          "Draw a conclusion: does the novel suggest justice is achievable, incomplete, or absent?"
        ],
        solution: "Early in the novel, justice is presented as an institutional ideal: the protagonist trusts the legal system to correct the wrong done to her family (Chapter 2 reference). By the final chapters, however, the court ruling in favour of the wealthy antagonist reveals that justice is compromised by power (Chapter 14 reference). The shift suggests the novel critiques systemic inequality — true justice remains aspirational rather than real. The author uses this arc to argue that justice requires not only law but also moral courage from individuals.",
        commonErrors: [
          "Discussing only one chapter when the question explicitly asks for two.",
          "Summarising events rather than analysing how the theme is constructed through character, imagery or structure.",
          "Stating a conclusion without supporting it with textual evidence."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Skryf 'n PEEL-paragraaf oor hoe die ruimte die protagonis se gedrag beïnvloed in die voorgeskrewe roman.",
        steps: [
          "Punt: formuleer 'n duidelike onderwerpsin wat die ruimte direk met gedrag verbind.",
          "Bewys: haal aan of verwys naby na 'n spesifieke toneel waar die ruimte beskryf word.",
          "Verduidelik: toon hoe die besonderhede van die ruimte die karakter se keuses veroorsaak of beperk.",
          "Skakel: verbind terug na die tema of die vraag om die paragraaf af te sluit."
        ],
        solution: "Punt: Die onderdrukkende plattelandse ruimte beperk die protagonis se vermoë om haar mishandelende verhouding te ontvlug. Bewys: Die outeur beskryf 'n plaas 'omring deur niks anders as stof en stilte vir vyftig kilometer in elke rigting nie'. Verduidelik: Hierdie fisiese isolasie verwyder praktiese opsies — geen vervoer, geen bure, geen veiligheid — en dwing haar om haar belager direk te konfronteer. Skakel: Die ruimte word dus 'n instrument van gevangeneming wat die sentrale konflik dryf.",
        commonErrors: [
          "Die verhaal herhaal in plaas van te ontleed hoe die ruimte gedrag veroorsaak.",
          "Die 'Verduidelik'-stap weglaat — 'n aanhaling lys is nie ontleding nie.",
          "Die skakel te vaag maak sonder om die spesifieke tema te noem."
        ]
      },
      {
        question: "Identifiseer en verduidelik die gebruik van 'n onbetroubare verteller in 'n uittreksel, met twee tekstuele voorbeelde.",
        steps: [
          "Definieer 'onbetroubare verteller' kortliks.",
          "Vind die eerste voorbeeld: soek teenstrydighede of self-regverdigings.",
          "Vind die tweede voorbeeld: soek momente waar ander karakters se reaksies die verteller se selfbeeld weerspreek.",
          "Verduidelik die outeur se doel met hierdie vertelstrategie."
        ],
        solution: "Onbetroubare verteller: 'n Eerstepersoons-stem wie se weergawe van gebeure verdraai word deur vooroordeel of beperkte kennis. Voorbeeld 1: Die verteller beweer 'almal het my gerespekteer' maar die uittreksel toon klasmaats wat hom spot — sy selfbeeld word weerspreek. Voorbeeld 2: Hy beskryf sy moeder se stilte as 'vredige begrip' terwyl haar liggaamstaal (trane, weggewende oë) pyn aandui. Die outeur gebruik onbetroubaarheid om lesers te dwing om krities te dink.",
        commonErrors: [
          "Eerstepersoons en derdepersoons-beperk verwar — onbetroubaarheid is spesifiek aan eerstepersoons.",
          "Slegs een voorbeeld gee wanneer twee gevra word.",
          "Vergeet om die outeur se doel te bespreek."
        ]
      },
      {
        question: "Vergelyk die behandeling van die tema van geregtigheid in twee verskillende hoofstukke van die roman.",
        steps: [
          "Definieer hoe geregtigheid vroeg in die roman voorgestel word.",
          "Definieer hoe geregtigheid later voorgestel word — wys ontwikkeling of kontras.",
          "Gebruik tekstuele bewys vir elke hoofstuk.",
          "Trek 'n gevolgtrekking: stel die roman voor dat geregtigheid bereikbaar, onvolledig of afwesig is?"
        ],
        solution: "Vroeër in die roman word geregtigheid voorgestel as 'n institusionele ideaal: die protagonis vertrou op die regstelsel. Teen die finale hoofstukke openbaar die hofbeslissing ten gunste van die ryk antagonis dat geregtigheid deur mag gekorrupteer is. Die verskuiwing stel voor dat die roman sistematiese ongelykheid kritiseer — ware geregtigheid bly strewendig eerder as werklik.",
        commonErrors: [
          "Slegs een hoofstuk bespreek wanneer twee gevra word.",
          "Gebeure opsom eerder as die tema ontleed.",
          "Gevolgtrekking sonder tekstuele bewys stel."
        ]
      }
    ]
  },

  "ENGH-2": {
    workedExamplesEn: [
      {
        question: "Explain how dramatic irony creates tension in the extract from the prescribed play.",
        steps: [
          "Define dramatic irony: the audience knows information that a character does not.",
          "Identify the specific information gap in this extract.",
          "Explain how that gap creates suspense or tension for the audience.",
          "Link to the playwright's purpose."
        ],
        solution: "Dramatic irony occurs when the audience knows more than the character on stage. In this extract, the audience knows the letter has not been delivered, but Juliet speaks happily about her plans — unaware of the catastrophe approaching. This knowledge gap creates agonising suspense: the audience wants to warn her but cannot. Shakespeare uses this to intensify emotional engagement and deepen the tragic impact.",
        commonErrors: [
          "Confusing dramatic irony with situational irony (which surprises characters and audience alike).",
          "Identifying the irony but not explaining the emotional effect on the audience.",
          "Forgetting to reference the playwright's purpose or technique."
        ]
      },
      {
        question: "Analyse how a soliloquy reveals character in a Shakespeare play.",
        steps: [
          "Define soliloquy: a character speaks alone on stage, giving the audience direct access to private thoughts.",
          "Quote or closely reference the soliloquy.",
          "Identify what the character reveals: inner conflict, desires, plans, fears.",
          "Explain what this adds to audience understanding that dialogue cannot."
        ],
        solution: "A soliloquy allows a character to speak directly to the audience without other characters hearing. In Hamlet's 'To be or not to be', Shakespeare reveals Hamlet's paralysis between action and inaction, life and death, duty and self-preservation. This private conflict — hidden behind his public performances — explains why he delays killing Claudius. Without the soliloquy, audiences would only see indecision; with it, they understand its philosophical roots.",
        commonErrors: [
          "Paraphrasing the soliloquy without analysing the character's inner state.",
          "Treating the soliloquy as a plot summary rather than a window into psychology.",
          "Not explaining what would be lost if the speech were a dialogue instead."
        ]
      },
      {
        question: "Discuss the role of stage directions in shaping meaning in a dramatic extract.",
        steps: [
          "Identify at least two stage directions in the extract.",
          "For each, explain what the direction signals about character emotion, power or relationship.",
          "Show how these directions work together with the dialogue.",
          "Comment on what a reader would miss without the directions."
        ],
        solution: "Stage directions are an author's instructions embedded in the script. In this extract, '[He turns away slowly]' signals suppressed emotion — the character controls his body to avoid showing pain, which contrasts with his calm words and reveals inner conflict. '[She moves to centre stage, takes his hand]' shifts power: she crosses to him, initiating physical connection and signalling dominance in the relationship. Together, these directions add subtext that the dialogue alone cannot convey — a film adaptation would show this visually, but readers must reconstruct it from the playwright's written cues.",
        commonErrors: [
          "Ignoring stage directions entirely or treating them as unimportant.",
          "Describing what the direction says without explaining its effect on meaning.",
          "Analysing direction in isolation from the surrounding dialogue."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik hoe dramatiese ironie spanning skep in die uittreksel uit die voorgeskrewe drama.",
        steps: [
          "Definieer dramatiese ironie: die gehoor weet inligting wat 'n karakter nie weet nie.",
          "Identifiseer die spesifieke kennisgaping in die uittreksel.",
          "Verduidelik hoe die gaping spanning vir die gehoor skep.",
          "Skakel na die dramaturg se doel."
        ],
        solution: "Dramatiese ironie ontstaan wanneer die gehoor meer weet as die karakter op die verhoog. In hierdie uittreksel weet die gehoor die brief is nie afgelewer nie, maar Juliet praat gelukkig oor haar planne — onbewus van die naderende ramp. Hierdie kennisgaping skep kwellende spanning: die gehoor wil haar waarsku maar kan nie. Die dramaturg gebruik dit om emosionele betrokkenheid te verskerp.",
        commonErrors: [
          "Dramatiese ironie met situasionele ironie verwar.",
          "Die ironie identifiseer sonder die emosionele effek op die gehoor te verduidelik.",
          "Die dramaturg se doel vergeet."
        ]
      },
      {
        question: "Ontleed hoe 'n aleenspraak karakter onthul in 'n Shakespeariese drama.",
        steps: [
          "Definieer aleenspraak: 'n karakter praat alleen op die verhoog.",
          "Haal aan of verwys naby na die aleenspraak.",
          "Identifiseer wat die karakter openbaar: innerlike konflik, begeertes, planne, vrese.",
          "Verduidelik wat dit by gehoorsbegrip voeg wat dialoog nie kan nie."
        ],
        solution: "Aleenspraak laat 'n karakter direk met die gehoor praat sonder dat ander karakters hoor. In Hamlet se 'To be or not to be' onthul Shakespeare Hamlet se verlamming tussen aksie en onaksie, lewe en dood. Hierdie private konflik verduidelik waarom hy uitstel om Claudius te dood. Sonder die aleenspraak sou gehore slegs onbeslistheid sien; daarmee verstaan hulle die filosofiese wortels.",
        commonErrors: [
          "Die aleenspraak parafreer sonder die innerlike toestand te ontleed.",
          "Die aleenspraak as 'n opsomming van gebeure behandel.",
          "Nie verduidelik wat verlore sou gaan as die toespraak 'n dialoog was nie."
        ]
      },
      {
        question: "Bespreek die rol van toneelaanwysings in die vorming van betekenis in 'n dramatiese uittreksel.",
        steps: [
          "Identifiseer ten minste twee toneelaanwysings in die uittreksel.",
          "Verduidelik vir elkeen wat dit aandui oor karakter, emosie, mag of verhouding.",
          "Wys hoe hierdie aanwysings saam met die dialoog werk.",
          "Kommentaar oor wat 'n leser sou misloop sonder die aanwysings."
        ],
        solution: "Toneelaanwysings is 'n outeur se instruksies ingebed in die teks. '[Hy draai stadig weg]' dui op onderdrukte emosie — die karakter beheer sy liggaam om pyn te verberg, wat kontrasteer met sy kalm woorde. '[Sy beweeg na die middel, neem sy hand]' verskuif mag: sy kruis na hom toe, wat dominansie in die verhouding aandui. Saam voeg hierdie aanwysings subteks by wat dialoog alleen nie kan oordra nie.",
        commonErrors: [
          "Toneelaanwysings ignoreer of as onbelangrik behandel.",
          "Beskryf wat die aanwysing sê sonder die effek op betekenis te verduidelik.",
          "Aanwysings in isolasie van die omliggende dialoog ontleed."
        ]
      }
    ]
  },

  "ENGH-3": {
    workedExamplesEn: [
      {
        question: "Analyse the effect of the extended metaphor in the poem, quoting at least two lines.",
        steps: [
          "Identify the tenor (the subject) and the vehicle (what it is compared to) of the metaphor.",
          "Find where the metaphor begins and track it through the poem.",
          "Quote two specific lines that develop the metaphor.",
          "Explain the cumulative effect of sustaining the comparison across multiple lines."
        ],
        solution: "Tenor: life; vehicle: a journey by sea. The poet establishes the metaphor in line 1 ('I have launched my boat upon uncertain waters') and sustains it through 'the storm-tossed hull of my days' (line 5) and 'I steer by stars that shift' (line 9). The sustained comparison creates a sense of life as inherently perilous and directionless. By the final stanza's 'harbour of your love', the metaphor resolves: human connection becomes the only safe destination. The extension of the metaphor allows the emotional journey to feel physically real to the reader.",
        commonErrors: [
          "Identifying a single simile and calling it an extended metaphor — extended implies the comparison runs through multiple lines.",
          "Paraphrasing the lines instead of quoting them.",
          "Identifying the metaphor but not explaining its accumulated emotional effect."
        ]
      },
      {
        question: "Identify the rhyme scheme of the poem and explain how it contributes to tone.",
        steps: [
          "Label the end sound of each line with a letter (A, B, C…) to map the scheme.",
          "Identify the pattern (e.g. ABAB, AABB, ABCABC).",
          "Explain whether the scheme is strict or irregular.",
          "Discuss how the regularity or irregularity of the scheme supports the poem's tone."
        ],
        solution: "Labelling each line: 'night' = A, 'day' = B, 'light' = A, 'way' = B, 'cold' = C, 'breath' = D, 'hold' = C, 'death' = D → ABABCDCD. This is a regular alternate rhyme scheme. The consistency creates a controlled, measured tone that mirrors the speaker's attempt to impose order on grief — even as the subject matter (death, loss) is chaotic, the form maintains dignity and restraint. The scheme enacts the poem's message: structure is how we survive disorder.",
        commonErrors: [
          "Mislabelling lines by ignoring near-rhymes or slant rhymes.",
          "Identifying the scheme without connecting it to tone or meaning.",
          "Confusing rhyme scheme with rhythm (metre) — they are different devices."
        ]
      },
      {
        question: "Explain how personification and imagery work together in a stanza of the prescribed poem.",
        steps: [
          "Quote the stanza.",
          "Identify the personification: which non-human entity is given human qualities?",
          "Identify the imagery: which sense (sight, sound, touch, etc.) is engaged?",
          "Explain how both devices together create a unified emotional or thematic effect."
        ],
        solution: "Stanza: 'The wind whispered secrets to the trembling grass / and the river wept all night beneath the stars.' Personification: wind whispers (human act of communication), river weeps (human emotion of grief). Imagery: auditory — 'whispered', 'wept'; visual — 'trembling', 'beneath the stars'. Together, the devices create a landscape alive with feeling — nature mirrors the speaker's own loneliness and sorrow, suggesting that grief is universal and embedded in the natural world. This technique is called pathetic fallacy.",
        commonErrors: [
          "Listing the devices separately without explaining how they work together.",
          "Confusing simile ('like the wind') with personification ('the wind whispers').",
          "Failing to identify which specific sense the imagery appeals to."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Ontleed die effek van die uitgebreide metafoor in die gedig, met aanhaling van ten minste twee reëls.",
        steps: [
          "Identifiseer die tenor (die onderwerp) en die voertuig (waarmee vergelyk word).",
          "Vind waar die metafoor begin en volg dit deur die gedig.",
          "Haal twee spesifieke reëls aan wat die metafoor ontwikkel.",
          "Verduidelik die kumulatiewe effek van die volgehoue vergelyking."
        ],
        solution: "Tenor: die lewe; voertuig: 'n see-reis. Die digter vestig die metafoor in reël 1 en volhou dit deur 'n storm-geteisterde skip (reël 5) en stuur deur verskuiwende sterre (reël 9). Die volgehoue vergelyking skep 'n gevoel dat die lewe inherent gevaarlik en rigtingloos is. Die uitbreiding van die metafoor laat die emosionele reis fisies werklik voel vir die leser.",
        commonErrors: [
          "Een vergelyking identifiseer en dit 'uitgebreide metafoor' noem — uitgebrei beteken dit loop oor meerdere reëls.",
          "Reëls parafraseer in plaas van aanhaal.",
          "Die metafoor identifiseer sonder die geakkumuleerde emosionele effek te verduidelik."
        ]
      },
      {
        question: "Identifiseer die rymskema van die gedig en verduidelik hoe dit bydra tot toon.",
        steps: [
          "Merk die eindklank van elke reël met 'n letter (A, B, C…) om die skema te karteer.",
          "Identifiseer die patroon (bv. ABAB, AABB).",
          "Verduidelik of die skema streng of onreëlmatig is.",
          "Bespreek hoe die reëlmatigheid of onreëlmatigheid van die skema die toon ondersteun."
        ],
        solution: "Etikettering: 'nag' = A, 'dag' = B, 'lag' = A, 'vlag' = B → ABAB. Dit is 'n reëlmatige wisselrymskema. Die konsekwentheid skep 'n beheerste, gemete toon wat die spreker se poging weerspieël om orde aan droefheid op te lê — selfs terwyl die onderwerp (dood, verlies) chaotiese is, handhaaf die vorm waardigheid. Die skema beliggaam die boodskap van die gedig: struktuur is hoe ons wanorde oorleef.",
        commonErrors: [
          "Reëls verkeerd etiketteer deur nabyvorme of skuinsryme te ignoreer.",
          "Die skema identifiseer sonder dit aan toon of betekenis te koppel.",
          "Rymskema met ritme (maat) verwar — hulle is verskillende toestelle."
        ]
      },
      {
        question: "Verduidelik hoe personifikasie en beeldspraak saamwerk in 'n strofe van die voorgeskrewe gedig.",
        steps: [
          "Haal die strofe aan.",
          "Identifiseer die personifikasie: watter nie-menslike entiteit kry menslike eienskappe?",
          "Identifiseer die beeldspraak: watter sintuig word betrek?",
          "Verduidelik hoe albei toestelle saam 'n verenigde emosionele of tematiese effek skep."
        ],
        solution: "Personifikasie: wind fluister (menslike kommunikasie), rivier huil (menslike emosie van droefheid). Beeldspraak: ouditief — 'fluister', 'huil'; visueel — 'bewerend', 'onder die sterre'. Saam skep die toestelle 'n landskap lewendig van gevoel — natuur weerspieël die spreker se eie eensaamheid. Hierdie tegniek staan bekend as patosiese dwaling (pathetic fallacy).",
        commonErrors: [
          "Die toestelle apart lys sonder te verduidelik hoe hulle saamwerk.",
          "Vergelyking ('soos die wind') met personifikasie ('die wind fluister') verwar.",
          "Versuim om te identifiseer watter sintuig die beeldspraak aanspreek."
        ]
      }
    ]
  },

  "ENGH-4": {
    workedExamplesEn: [
      {
        question: "Analyse how point of view shapes the reader's sympathy in a short story extract.",
        steps: [
          "Identify the narrative perspective (first person, third limited, third omniscient).",
          "Explain what information the narrator can and cannot access.",
          "Show how this limited or expanded access directs the reader's sympathy.",
          "Suggest how a different POV would change reader response."
        ],
        solution: "The extract uses a first-person narrator — the protagonist's abusive father. Access is limited to his self-justifying thoughts: he describes punishing his child as 'teaching discipline'. The reader, however, notices the child's silence and flinching — details the narrator mentions but does not interpret correctly. By filtering the story through the abuser's flawed perspective, the author creates dramatic irony: the reader sees the harm the narrator cannot. Sympathy is directed towards the silent child, not the oblivious narrator. A third-person omniscient perspective would remove this ambiguity and reduce the story's moral complexity.",
        commonErrors: [
          "Confusing the narrator with the author — the narrator is a character, not the writer's voice.",
          "Describing point of view without showing how it actually shapes sympathy.",
          "Ignoring what the narrator fails to notice, which is often the most revealing information."
        ]
      },
      {
        question: "Discuss how a short story achieves 'unity of effect' through its ending.",
        steps: [
          "Define unity of effect: every element of the story builds toward a single dominant emotional impression.",
          "Identify the dominant effect the story creates (e.g. horror, grief, irony, hope).",
          "Show how the ending crystallises this effect.",
          "Explain two earlier story elements (setting, characterisation, conflict) that prepared for the ending."
        ],
        solution: "Unity of effect means the story creates one dominant impression. Here, the effect is quiet devastation. The ending — the protagonist simply leaves without looking back — crystallises this: she has run out of grief and hope simultaneously. Earlier elements prepared for this: the grey, empty setting (established in paragraph 1) foreshadowed emotional depletion, and the protagonist's repeated half-sentences (refusing to finish thoughts) built a pattern of suppression. The ending does not resolve the conflict; it demonstrates that some wounds are beyond resolution — achieving its effect through restraint.",
        commonErrors: [
          "Summarising the ending rather than analysing how it achieves an emotional effect.",
          "Treating the ending in isolation without connecting it to earlier story elements.",
          "Choosing a vague effect ('sad') without specifying its quality and source."
        ]
      },
      {
        question: "Rewrite a passage using 'show, don't tell' instead of direct emotional statement.",
        steps: [
          "Identify the direct emotional statement to replace (e.g. 'She was devastated.').",
          "Think of the physical symptoms of that emotion.",
          "Think of the character's actions and speech patterns that reveal the emotion.",
          "Write the rewrite using only showing — no direct naming of the emotion."
        ],
        solution: "Original: 'He was furious when he saw the broken window.' Rewrite: 'He stood in the doorway, staring at the shards of glass scattered across the floor. His knuckles whitened around the door frame. He took a slow breath through his nose, said nothing, and walked back to his car.' Analysis: fury is conveyed through clenched physical control (whitened knuckles, slow breath), deliberate silence (no outburst), and abrupt exit — without the word 'furious' appearing anywhere.",
        commonErrors: [
          "Using obvious emotional adverbs ('He slammed the door angrily') — this tells and shows simultaneously.",
          "Showing only one detail when multiple senses and actions create a fuller impression.",
          "Writing melodramatic action (throwing objects) when subtle restraint is often more powerful."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Ontleed hoe gesigspunt die leser se simpatie in 'n kortverhaal-uittreksel vorm.",
        steps: [
          "Identifiseer die vertelstandpunt (eerstepersoons, derdepersoons beperk, derdepersoons alwetend).",
          "Verduidelik watter inligting die verteller wel en nie kan bereik nie.",
          "Wys hoe hierdie toegang die leser se simpatie rig.",
          "Stel voor hoe 'n ander gesigspunt die leserreaksie sou verander."
        ],
        solution: "Die uittreksel gebruik 'n eerstepersoons-verteller — die protagonis se mishandelde vader. Toegang is beperk tot sy self-regverdigende gedagtes. Die leser merk egter die kind se stilte en skok — besonderhede wat die verteller noem maar nie korrek interpreteer nie. Deur die storie deur die oortreder se gebrekkige perspektief te filter, skep die outeur dramatiese ironie: die leser sien die skade wat die verteller nie kan sien nie.",
        commonErrors: [
          "Die verteller met die outeur verwar — die verteller is 'n karakter, nie die skrywer se stem nie.",
          "Gesigspunt beskryf sonder te wys hoe dit simpatie werklik vorm.",
          "Ignoreer wat die verteller nie opmerk nie, wat dikwels die mees onthullende inligting is."
        ]
      },
      {
        question: "Bespreek hoe 'n kortverhaal 'eenheid van effek' bereik deur sy einde.",
        steps: [
          "Definieer eenheid van effek: elke element van die verhaal bou na 'n enkele dominante emosionele indruk.",
          "Identifiseer die dominante effek (bv. afsku, droefheid, ironie, hoop).",
          "Wys hoe die einde hierdie effek kristalliseer.",
          "Verduidelik twee vroeëre storie-elemente wat vir die einde voorberei het."
        ],
        solution: "Eenheid van effek beteken die verhaal skep een dominante indruk: hier stille verwoesting. Die einde — die protagonis verlaat sonder om terug te kyk — kristalliseer dit. Vroeëre elemente het daarvoor voorberei: die grys, leë ruimte en die protagonis se herhaalde half-sinne. Die einde los nie die konflik op nie; dit demonstreer dat sommige wonde buite oplossing is — en bereik sy effek deur beheersing.",
        commonErrors: [
          "Die einde opsom eerder as te ontleed hoe dit 'n emosionele effek bereik.",
          "Die einde in isolasie behandel sonder om dit aan vroeëre elemente te koppel.",
          "'n Vae effek kies ('hartseer') sonder om die kwaliteit en bron te spesifiseer."
        ]
      },
      {
        question: "Herskryf 'n gedeelte met 'wys, moenie sê nie' in plaas van direkte emosionele stelling.",
        steps: [
          "Identifiseer die direkte emosionele stelling wat vervang moet word.",
          "Dink aan die fisiese simptome van die emosie.",
          "Dink aan die karakter se aksies en spraakpatrone wat die emosie onthul.",
          "Skryf die herskrywing met slegs wys — geen direkte noem van die emosie nie."
        ],
        solution: "Oorspronklik: 'Hy was woedend toe hy die gebreekte venster sien.' Herskrywing: 'Hy het in die deuropening gestaan en na die glasskerwe op die vloer gestaar. Sy knukkels het wit geword rondom die deurkosyn. Hy het stadig deur sy neus asemgehaal, niks gesê nie, en teruggestap na sy motor.' Woede word oorgedra deur fisiese beheer, doelbewuste stilte en skielike vertrek.",
        commonErrors: [
          "Duidelike emosionele bywoorde gebruik ('Hy het die deur toornig toegeslaan').",
          "Slegs een besonderheid wys wanneer meerdere sintuie 'n voller indruk skep.",
          "Dramatiese aksies skryf wanneer subtiele beheersing dikwels kragtiger is."
        ]
      }
    ]
  },

  "ENGH-5": {
    workedExamplesEn: [
      {
        question: "Transform the following into passive voice: 'The manager reviewed all applications before the deadline.'",
        steps: [
          "Identify the subject (the manager), verb (reviewed), and object (all applications).",
          "The object becomes the new subject: 'All applications'.",
          "Form the passive verb: 'was/were' + past participle of 'review' → 'were reviewed'.",
          "Add 'by the manager' if the agent is important; add time phrase at the end."
        ],
        solution: "All applications were reviewed by the manager before the deadline. Note: 'by the manager' may be omitted if the agent is unimportant or unknown — 'All applications were reviewed before the deadline.' The tense of 'was/were' must match the original tense (simple past → 'were').",
        commonErrors: [
          "Using 'was reviewed' instead of 'were reviewed' — the new subject 'applications' is plural.",
          "Keeping the original subject in subject position: 'The manager were reviewed…' — incorrect.",
          "Forgetting to change the verb to past participle (e.g. using 'review' instead of 'reviewed')."
        ]
      },
      {
        question: "Convert this direct speech to indirect (reported) speech: She said, 'I will finish the project tomorrow.'",
        steps: [
          "Identify the reporting verb tense: 'said' (simple past) → triggers backshift.",
          "Backshift the tense: 'will' → 'would'.",
          "Change first-person pronouns to match the context: 'I' → 'she'.",
          "Change time expressions: 'tomorrow' → 'the next day' / 'the following day'.",
          "Remove quotation marks and the comma after 'said'."
        ],
        solution: "She said that she would finish the project the next day. Key changes: 'will' → 'would' (modal backshift); 'I' → 'she' (pronoun shift); 'tomorrow' → 'the next day' (time expression shift); comma + quotation marks removed; 'that' added (optional but recommended for formal style).",
        commonErrors: [
          "Forgetting to backshift the modal: keeping 'will' instead of changing to 'would'.",
          "Keeping 'tomorrow' instead of changing to 'the next day'.",
          "Keeping the first-person pronoun: 'she said I would finish' (ambiguous — who is 'I'?)."
        ]
      },
      {
        question: "Identify and correct all errors in this sentence: 'The team of players were ready, and they has trained for months.'",
        steps: [
          "Check subject-verb concord for 'The team…were': 'team' is a collective noun — in standard SA English, it takes a singular verb.",
          "Correct: 'The team…was ready'.",
          "Check 'they has trained': 'they' is third-person plural → requires 'have', not 'has'.",
          "Correct: 'they have trained'.",
          "Check tense consistency: 'was ready' (simple past) and 'have trained' (present perfect) — is the time sequence logical? If everything happened in the past, 'had trained' is better."
        ],
        solution: "Corrected: 'The team of players was ready, and they had trained for months.' Errors fixed: 1. 'were' → 'was' (team = singular collective noun). 2. 'has' → 'had' (plural pronoun 'they' + past perfect for sequence).",
        commonErrors: [
          "Treating 'team of players' as plural because 'players' is plural — the head noun is 'team', which governs concord.",
          "Changing 'has' to 'have' (present perfect) without also considering tense consistency with the past context.",
          "Overcorrecting by changing correct elements: 'and' does not need changing."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verander na passiewe vorm: 'Die bestuurder het alle aansoeke voor die sperdatum hersien.'",
        steps: [
          "Identifiseer die onderwerp (die bestuurder), werkwoord (het hersien), en voorwerp (alle aansoeke).",
          "Die voorwerp word die nuwe onderwerp: 'Alle aansoeke'.",
          "Vorm die passiewe werkwoord: 'is/was' + verlede deelwoord van 'hersien'.",
          "Voeg 'deur die bestuurder' by indien die agent belangrik is."
        ],
        solution: "Alle aansoeke is voor die sperdatum deur die bestuurder hersien. Let op: 'deur die bestuurder' kan weggelaat word as die agent onbelangrik of onbekend is. Die tyd van 'is/was' moet ooreenstem met die oorspronklike tyd.",
        commonErrors: [
          "'was' in plaas van 'is' gebruik — verlede tyd moet ooreenstem met die oorspronklike.",
          "Die oorspronklike onderwerp in subjekposisie hou.",
          "Vergeet om die werkwoord na verlede deelwoord te verander."
        ]
      },
      {
        question: "Verander hierdie direkte rede na indirekte rede: Sy het gesê, 'Ek sal die projek môre voltooi.'",
        steps: [
          "Identifiseer die rapporteringswerkwoord tyd: 'het gesê' (verlede tyd) → aktiveer terugverskuiwing.",
          "Verskuif die tyd terug: 'sal' → 'sou'.",
          "Verander eerstepersoon voornaamwoorde: 'Ek' → 'sy'.",
          "Verander tyduitdrukkings: 'môre' → 'die volgende dag'.",
          "Verwyder aanhalingstekens en die komma na 'gesê'."
        ],
        solution: "Sy het gesê dat sy die projek die volgende dag sou voltooi. Sleutelveranderinge: 'sal' → 'sou'; 'Ek' → 'sy'; 'môre' → 'die volgende dag'; aanhalingstekens verwyder.",
        commonErrors: [
          "Vergeet om die modale werkwoord terug te verskuif: 'sal' hou in plaas van 'sou'.",
          "'Môre' hou in plaas van 'die volgende dag'.",
          "Die eerstepersoon voornaamwoord hou: 'sy het gesê ek sou'."
        ]
      },
      {
        question: "Identifiseer en korrigeer alle foute in: 'Die span van spelers was gereed, en hulle het maande lank geoefen gehad.'",
        steps: [
          "Kontroleer onderwerp-werkwoord ooreenkoms vir 'Die span…was': 'span' is 'n kollektiewe naamwoord — neig na enkelvoud.",
          "Kontroleer 'geoefen gehad': verledetyd-voltooide verlede — klink grammatikaal foutief in Afrikaans.",
          "Korrigeer na 'geoefen het' of 'al maande lank geoefen het'.",
          "Kontroleer tydskonsekwentheid."
        ],
        solution: "Gekorrekteerd: 'Die span van spelers was gereed, en hulle het maande lank geoefen.' Foute reggestel: 'geoefen gehad' → 'geoefen het' (Afrikaans gebruik nie 'het…gehad' vir voltooide verlede in hierdie konteks nie).",
        commonErrors: [
          "'Span van spelers' as meervoud behandel omdat 'spelers' meervoud is.",
          "Tydskonsekwentheid ignoreer.",
          "Korrekte elemente oor-korrigeer."
        ]
      }
    ]
  },

  "ENGH-6": {
    workedExamplesEn: [
      {
        question: "Read the passage and write a summary of 7 main points in no more than 80 words.",
        steps: [
          "Skim the passage to identify the main topic and general argument.",
          "Read carefully and underline the key idea in each paragraph (usually the topic sentence).",
          "List 7 key ideas — do NOT include minor details or examples unless they are the main point.",
          "Rewrite these ideas in your own words in full sentences, staying under 80 words."
        ],
        solution: "Process demonstrated on a practice paragraph: Main ideas identified from each paragraph: 1. Screen time harms sleep. 2. Social media raises anxiety. 3. Academic performance declines. 4. Physical activity decreases. 5. Attention spans shorten. 6. Positive use (learning, connection) is possible. 7. Parental monitoring reduces risk. Summary written in own words within 80 words, without direct quotation from the source. Mark yourself: are all 7 ideas present? Is direct quotation avoided? Is word count within limit?",
        commonErrors: [
          "Quoting directly from the passage — the examiner requires your own words.",
          "Including more than 7 points or merging ideas incorrectly.",
          "Exceeding 80 words — this results in a mark penalty."
        ]
      },
      {
        question: "Distinguish between a fact and an opinion in the given passage, identifying one of each.",
        steps: [
          "Define fact: a statement that can be objectively verified.",
          "Define opinion: a personal judgement that reflects a viewpoint and cannot be objectively proven.",
          "Find a sentence in the passage that states verifiable data.",
          "Find a sentence in the passage that uses evaluative language (should, best, worst, clearly, obviously)."
        ],
        solution: "Fact: 'Studies published in The Lancet (2023) show that teenagers who use screens for more than 4 hours daily sleep on average 47 minutes less than recommended.' — verifiable, attributed to a study, contains specific data. Opinion: 'Clearly, social media companies are destroying the mental health of an entire generation.' — uses 'clearly' (signals the writer's certainty, not objective proof), makes a sweeping generalisation not supported by cited evidence in this paragraph.",
        commonErrors: [
          "Calling a statistic an opinion because it sounds alarming — data is still a fact if it is cited.",
          "Calling a moderate evaluative statement a fact because it feels neutral.",
          "Identifying the fact/opinion without explaining why the classification applies."
        ]
      },
      {
        question: "Infer the tone of the passage and support your answer with two textual examples.",
        steps: [
          "Read the passage noting emotional language, word choice and sentence structure.",
          "Choose one overall tone word (e.g. critical, cautionary, optimistic, sarcastic, urgent).",
          "Find example 1: a word or phrase that establishes the tone.",
          "Find example 2: a sentence structure or punctuation choice that reinforces the tone."
        ],
        solution: "Tone: urgently cautionary. Example 1: 'We are running out of time to reverse the damage being done to youth.' — 'running out of time' and 'damage' convey alarm and time pressure. Example 2: The repeated short sentences ('Act now. Monitor carefully. Educate broadly.') create an imperative, urgent rhythm — the brevity mimics the urgency of the message. Together, the word choice and syntax establish that the writer considers this a crisis requiring immediate action.",
        commonErrors: [
          "Describing the topic ('the passage is about screen time') instead of the tone.",
          "Choosing a tone word but not supporting it with textual evidence.",
          "Quoting a word without explaining how it creates the stated tone."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Lees die teks en skryf 'n opsomming van 7 hoofpunte in nie meer as 80 woorde nie.",
        steps: [
          "Skim die teks om die hooftema en algemene argument te identifiseer.",
          "Lees noukeurig en onderstreep die sleutelgedagte in elke paragraaf.",
          "Lys 7 sleutelgedagtes — moenie minder belangrike besonderhede insluit nie.",
          "Herskryf hierdie gedagtes in eie woorde in volsin, binne 80 woorde."
        ],
        solution: "Sleutelgedagtes geïdentifiseer: 1. Skerptyd skaad slaap. 2. Sosiale media verhoog angs. 3. Akademiese prestasie daal. 4. Fisiese aktiwiteit verminder. 5. Aandag-spanne verkort. 6. Positiewe gebruik (leer, verbinding) is moontlik. 7. Ouerbewaking verminder risiko. Opsomming in eie woorde binne 80 woorde, sonder direkte aanhaling.",
        commonErrors: [
          "Direk uit die teks aanhaal — die eksaminator vereis eie woorde.",
          "Meer as 7 punte insluit of idees verkeerd saamvoeg.",
          "80 woorde oorskry — dit lei tot 'n merkstraf."
        ]
      },
      {
        question: "Onderskei tussen 'n feit en 'n mening in die teks, met een voorbeeld van elk.",
        steps: [
          "Definieer feit: 'n stelling wat objektief geverifieer kan word.",
          "Definieer mening: 'n persoonlike oordeel wat 'n standpunt weerspieël.",
          "Vind 'n sin in die teks wat verifieerbare data stel.",
          "Vind 'n sin met evaluatiewe taal (behoort, beste, duidelik, uiteraard)."
        ],
        solution: "Feit: 'Studies toon dat tieners meer as 4 uur skerptyd gemiddeld 47 minute minder slaap as aanbeveel.' — verifieerbaar, toegeskryf aan 'n studie, bevat spesifieke data. Mening: 'Duidelik vernietig sosiale media-maatskappye die geestesgesondheid van 'n hele geslag.' — 'duidelik' dui op die skrywer se sekerheid, nie objektiewe bewys nie.",
        commonErrors: [
          "'n Statistiek 'n mening noem omdat dit alarmties klink — data is steeds 'n feit as dit aangehaal word.",
          "'n Matige evaluatiewe stelling 'n feit noem omdat dit neutraal voel.",
          "Die feit/mening identifiseer sonder te verduidelik hoekom die klassifikasie van toepassing is."
        ]
      },
      {
        question: "Lei die toon van die teks af en ondersteun jou antwoord met twee tekstuele voorbeelde.",
        steps: [
          "Lees die teks en let op emosionele taal, woordkeuse en sinstruktuur.",
          "Kies een algehele toonwoord (bv. krities, waarskuwend, optimisties, dringend).",
          "Vind voorbeeld 1: 'n woord of frase wat die toon vestig.",
          "Vind voorbeeld 2: 'n sinstruktuur of leesteken keuse wat die toon versterk."
        ],
        solution: "Toon: dringend waarskuwend. Voorbeeld 1: 'Ons loop tyd kort om die skade aan die jeug te keer' — 'loop tyd kort' en 'skade' dra alarm en tydsdruk oor. Voorbeeld 2: Herhaalde kort sinne ('Handel nou. Monitor noukeurig. Leer breedweg.') skep 'n gebiedende, dringende ritme. Saam vestig woordkeuse en sintaksis dat die skrywer dit as 'n krisis beskou.",
        commonErrors: [
          "Die onderwerp beskryf ('die teks handel oor skerptyd') in plaas van die toon.",
          "'n Toonwoord kies sonder tekstuele bewys.",
          "'n Woord aanhaal sonder te verduidelik hoe dit die toon skep."
        ]
      }
    ]
  },

  "ENGH-7": {
    workedExamplesEn: [
      {
        question: "Write a thesis statement for the following argumentative essay topic: 'Social media has done more harm than good to young people.'",
        steps: [
          "A thesis statement must: state your position clearly, preview the main arguments, and be specific enough to guide the essay.",
          "Decide your stance: agree, disagree, or partially agree.",
          "List 2-3 main arguments that will structure your essay.",
          "Combine position + arguments into one complex sentence."
        ],
        solution: "Thesis (agreeing): 'Although social media enables global connectivity and access to information, it has done more harm than good to young people by eroding mental health, spreading misinformation, and fuelling damaging social comparison.' Analysis: position is clear ('more harm'); concession in subordinate clause prevents over-simplification; three preview arguments guide essay structure; specific and arguable.",
        commonErrors: [
          "Writing a fact as a thesis: 'Social media is used by billions of people' — this is undeniable and unarguable.",
          "Being too vague: 'Social media is bad' — no specific arguments previewed.",
          "Writing a question as a thesis — a thesis must be a statement, not a question."
        ]
      },
      {
        question: "Plan and write a PEEL body paragraph for an argumentative essay on: 'All learners should wear school uniform.'",
        steps: [
          "Point (P): make a clear topic sentence that directly answers the question.",
          "Evidence (E): provide a fact, statistic, example or quotation supporting the point.",
          "Explain (E): unpack the evidence — show exactly HOW it proves your point.",
          "Link (L): connect back to the question or thesis in the final sentence."
        ],
        solution: "P: School uniforms reduce socioeconomic inequality among learners by removing visible markers of wealth. E: A 2022 study by the SA Department of Basic Education found that learners in uniform-wearing schools self-reported 34% lower rates of bullying related to clothing. E: When learners cannot distinguish between those who can afford branded clothing and those who cannot, the social hierarchies formed around material wealth dissolve — creating a more equitable learning environment. L: Uniforms therefore serve not merely as dress codes but as equity tools that protect vulnerable learners.",
        commonErrors: [
          "Writing a 'PE' paragraph — making a point and citing evidence without explaining how the evidence proves the point.",
          "Forgetting the Link sentence, leaving the paragraph 'floating' without connection to the essay's argument.",
          "Choosing weak or unverifiable evidence: 'everyone knows that uniforms help' — this is an assertion, not evidence."
        ]
      },
      {
        question: "Write a strong introduction for a descriptive essay titled: 'The street I grew up on.'",
        steps: [
          "Hook: begin with an image, question, or striking detail that draws the reader in.",
          "Context: introduce the subject briefly without revealing everything.",
          "Thesis/focus: indicate the dominant impression or feeling the essay will convey.",
          "Keep the introduction to 5-7 sentences."
        ],
        solution: "The smell of braai smoke and frangipane still meets me sometimes, a ghost-scent conjured by heat on tar — and suddenly I am six years old again, standing barefoot on Jacaranda Street. It was not a grand street. It was not even a particularly beautiful one. But for twelve years, its cracked pavements, its noisy Saturday afternoons, and the particular quality of its late-afternoon light made up the geography of everything I believed the world to be. This essay traces the details of that street: not as it is, but as it was — and as it will always exist in the version of me that was made there.",
        commonErrors: [
          "Beginning with a dictionary definition: 'According to Oxford, a street is…' — this is the weakest possible hook.",
          "Writing a narrative introduction when a descriptive focus is required — description centres on sensory detail, not event sequence.",
          "Revealing too much in the introduction, leaving nothing for the body paragraphs to develop."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Skryf 'n tesisstelling vir die betogende opsteltema: 'Sosiale media het meer skade as goed gedoen aan jong mense.'",
        steps: [
          "Bepaal jou standpunt: saamstem, verskil of gedeeltelik saamstem.",
          "Lys 2-3 hoofargumente wat jou opstel sal struktureer.",
          "Kombineer standpunt + argumente in een komplekse sin."
        ],
        solution: "Tesisstelling (saamstem): 'Alhoewel sosiale media globale verbinding en toegang tot inligting moontlik maak, het dit meer skade as goed gedoen aan jong mense deur geestesgesondheid te ondermyn, wanpersepsie te versprei en skadelike sosiale vergelyking aan te blaas.' Analise: standpunt is duidelik; toegewing in die bysin verhoed oor-vereenvoudiging; drie voorskou-argumente lei die opstel struktuur.",
        commonErrors: [
          "'n Feit as 'n tesisstelling skryf — dit moet betwisbaar wees.",
          "Te vaag wees: 'Sosiale media is sleg' — geen spesifieke argumente voorskouend.",
          "'n Vraag as tesisstelling skryf — dit moet 'n stelling wees."
        ]
      },
      {
        question: "Beplan en skryf 'n PEEL-paragraaf vir 'n betogende opstel oor: 'Alle leerders behoort skooluniforme te dra.'",
        steps: [
          "Punt (P): maak 'n duidelike onderwerpsin wat die vraag direk beantwoord.",
          "Bewys (B): verskaf 'n feit, statistiek, voorbeeld of aanhaling.",
          "Verduidelik (V): pak die bewys uit — wys presies HOE dit jou punt bewys.",
          "Skakel (S): verbind terug na die vraag of tesisstelling."
        ],
        solution: "P: Skooluniforme verminder sosio-ekonomiese ongelykheid deur sigbare tekens van rykdom te verwyder. B: 'n 2022 studie het bevind dat leerders in uniforme-draende skole 34% laer vlakke van kleding-gegronde boelery rapporteer. V: Wanneer leerders nie tussen bevoorregte en benadeelde mede-leerders kan onderskei nie, verwyder dit sosiale hiërargieë rondom materiële rykdom. S: Uniforme dien dus nie bloot as kledregulasieklank nie maar as gelykheidsinstrument.",
        commonErrors: [
          "Slegs 'PE' skryf — punt en bewys gee sonder die verduideliking.",
          "Die skakelsin vergeet.",
          "Swak of onverifieerbare bewys kies: 'almal weet uniforme help'."
        ]
      },
      {
        question: "Skryf 'n sterk inleiding vir 'n beskrywende opstel getiteld: 'Die straat waarop ek grootgeword het.'",
        steps: [
          "Haak: begin met 'n beeld, vraag of treffende besonderheid.",
          "Konteks: stel die onderwerp kortliks voor.",
          "Fokus/tesisstelling: dui die dominante indruk of gevoel aan wat die opstel sal oordra.",
          "Hou die inleiding tot 5-7 sinne."
        ],
        solution: "Die reuk van braairook en frangipan ontmoet my soms nog, 'n spookgeur opgeroep deur hitte op teer — en skielik is ek weer ses jaar oud op Jakarandastraat. Dit was nie 'n groot straat nie. Maar vir twaalf jaar het sy gebarste sypaaie en die besondere kwaliteit van die middag-lig alles uitgemaak wat ek geglo het die wêreld is. Hierdie opstel volg die besonderhede van die straat: nie soos dit is nie, maar soos dit was.",
        commonErrors: [
          "Begin met 'n woordeboekdefinisie — dit is die swakste moontlike haak.",
          "'n Narratiewe inleiding skryf wanneer 'n beskrywende fokus vereis word.",
          "Te veel in die inleiding onthul, sodat niks vir die liggaam-paragrawe oorbly nie."
        ]
      }
    ]
  },

  "ENGH-8": {
    workedExamplesEn: [
      {
        question: "Write a formal letter applying for a part-time job at a bookshop.",
        steps: [
          "Use correct layout: your address (top right), date, recipient's address (left), formal salutation.",
          "Opening paragraph: state the position and where you saw the advertisement.",
          "Body paragraphs: highlight relevant skills and experience.",
          "Closing paragraph: thank the reader and indicate availability for interview.",
          "Close with 'Yours faithfully' (not 'Yours sincerely') when the recipient is unknown by name."
        ],
        solution: "14 Jacaranda Street / Pretoria / 0001 / 25 May 2026 // The Manager / BookWorld / 32 Main Street / Pretoria 0002 // Dear Sir/Madam // I am writing to apply for the position of part-time sales assistant advertised on the BookWorld website on 20 May 2026. [Body: relevant skills — I have a passion for literature, strong customer service skills, and experience assisting at the school library.] [Closing: I am available for an interview at your convenience.] // Yours faithfully / [Signature] / J. Dlamini",
        commonErrors: [
          "Using 'Yours sincerely' when the recipient's name is unknown — 'Yours faithfully' is required.",
          "Omitting the recipient's address — all formal letters require both addresses.",
          "Beginning the body with 'I am writing to say that' — state the purpose directly and specifically."
        ]
      },
      {
        question: "Write a newspaper report on a school science exhibition.",
        steps: [
          "Headline: short, punchy, captures the main event.",
          "Byline: author's name (optional in exam).",
          "Lead paragraph: answers Who, What, When, Where, Why in 2-3 sentences.",
          "Body: details, quotes from participants, follow-up information.",
          "Use third-person, past tense, formal register."
        ],
        solution: "HEADLINE: Westview High Dazzles at Annual Science Exhibition // LEAD: More than 200 projects were showcased at Westview High School's annual Science Exhibition on Friday, 22 May 2026, with learners from Grades 10 to 12 presenting research on topics ranging from water purification to AI ethics. // BODY: Science teacher Ms Radebe praised the 'exceptional quality' of entries this year, noting that three projects have been selected for the national SAASTEC competition. Learner Thabo Sithole (Grade 12) won first prize for his solar-powered water filter, designed for rural communities. The event attracted parents, teachers, and representatives from three local universities. // CLOSING: The school plans to hold regional qualifying rounds in August.",
        commonErrors: [
          "Writing in first person: 'I attended the exhibition and saw…' — news reports use third person.",
          "Burying the most important information in the middle — inverted pyramid structure puts key facts first.",
          "Using informal language or contractions: 'kids won prizes' → 'learners received awards'."
        ]
      },
      {
        question: "Draft minutes for a student representative council (SRC) meeting.",
        steps: [
          "Include: meeting name, date, time, venue, members present, apologies.",
          "Record each agenda item with a brief discussion note and resolution/action.",
          "Use the past tense for reporting what was said/decided.",
          "Conclude with next meeting date and signature of the chairperson."
        ],
        solution: "MINUTES OF THE SRC MEETING // Date: 25 May 2026 | Time: 14:00 | Venue: Library, Room 3 // Present: J. Dlamini (Chairperson), A. Singh (Secretary), T. Mokoena, L. van Wyk, P. Nkosi. Apologies: S. Patel. // 1. Welcome — The chairperson welcomed members and noted a quorum was present. 2. Approval of previous minutes — Minutes from 18 May were approved with no amendments. 3. Fundraising event — It was proposed and agreed that a cake sale be held on 5 June. A. Singh agreed to coordinate. 4. Next meeting — Scheduled for 8 June 2026 at 14:00. // Meeting adjourned at 15:15. // ________________ Signed: J. Dlamini (Chairperson)",
        commonErrors: [
          "Recording opinions verbatim rather than summarising decisions — minutes record decisions, not speeches.",
          "Using future tense instead of past tense for recording what was discussed.",
          "Omitting the action item and responsible person after each resolution."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Skryf 'n formele brief om aansoek te doen vir 'n deeltydse werk by 'n boekwinkel.",
        steps: [
          "Gebruik korrekte uitleg: jou adres (bo regs), datum, ontvanger se adres (links), formele aanhef.",
          "Openingsparagraaf: stel die pos en advertensie-bron.",
          "Liggaamparagrawe: beklemtoon relevante vaardighede en ervaring.",
          "Slotparagraaf: bedank en dui beskikbaarheid vir onderhoud aan.",
          "Sluit met 'Die uwe' wanneer die ontvanger se naam onbekend is."
        ],
        solution: "14 Jakarandastraat / Pretoria / 0001 / 25 Mei 2026 // Die Bestuurder / BoekWêreld / 32 Hoofstraat / Pretoria 0002 // Geagte Meneer/Mevrou // Ek skryf om aansoek te doen vir die deeltydse pos van verkoopsassistent geadverteer op die BoekWêreld-webwerf. [Liggaam: relevante vaardighede.] [Slot: Ek is beskikbaar vir 'n onderhoud.] // Die uwe / [Handtekening] / J. Dlamini",
        commonErrors: [
          "'Met vriendelike groete' gebruik wanneer die ontvanger se naam onbekend is — 'Die uwe' is korrek.",
          "Die ontvanger se adres weglaat.",
          "Die liggaam begin met 'Ek skryf om te sê dat' — stel die doel direk."
        ]
      },
      {
        question: "Skryf 'n koerantberig oor 'n skoolwetenskapuitstalling.",
        steps: [
          "Opskrif: kort, pakkend, vat die hoofgebeurtenis.",
          "Aanvangssin: beantwoord Wie, Wat, Wanneer, Waar, Hoekom in 2-3 sinne.",
          "Liggaam: besonderhede, aanhalings, opvolginligting.",
          "Gebruik derdepersoon, verlede tyd, formele register."
        ],
        solution: "OPSKRIF: Wesaansig Hoër Blink op Jaarlikse Wetenskapuitstalling // AANVANGSSIN: Meer as 200 projekte is vertoon by Wesaansig Hoër se jaarlikse Wetenskapuitstalling op Vrydag, 22 Mei 2026. // LIGGAAM: Wetenskap-onderwyser Me Radebe het die 'uitsonderlike kwaliteit' van inskrywings geloof. Leerder Thabo Sithole (Graad 12) het eerste prys gewen vir sy sonkrag-aangedrewe waterfilter. // SLOT: Die skool beplan omgewing kwalifiserende rondes in Augustus.",
        commonErrors: [
          "In eerstepersoon skryf: 'Ek het die uitstalling bygewoon' — koerantberigte gebruik derdepersoon.",
          "Die belangrikste inligting in die middel begrawe — omgekeerde piramied-struktuur stel sleutelfeite eerste.",
          "Informele taal gebruik: 'kinders het pryse gewen' → 'leerders het toekennings ontvang'."
        ]
      },
      {
        question: "Stel notules op vir 'n SRK-vergadering.",
        steps: [
          "Insluit: vergaderingnaam, datum, tyd, plek, teenwoordiges, verskonings.",
          "Teken elke agendapunt op met 'n kort besprekingsnota en besluit/aksie.",
          "Gebruik verlede tyd vir die verslagdoening van wat gesê/besluit is.",
          "Sluit af met die volgende vergaderingsdatum en handtekening van die voorsitter."
        ],
        solution: "NOTULE VAN SRK-VERGADERING // Datum: 25 Mei 2026 | Tyd: 14:00 | Plek: Biblioteek, Kamer 3 // Teenwoordig: J. Dlamini (Voorsitter), A. Singh (Sekretaresse). Verskonings: S. Patel. // 1. Verwelkoming. 2. Goedkeuring van vorige notule. 3. Fondsinsamelingsgeleentheid — Dit is voorgestel en ooreengekom dat 'n koekverkoping op 5 Junie gehou word. // Vergadering verdaag om 15:15. // Geteken: J. Dlamini",
        commonErrors: [
          "Menings woordeliks opteken eerder as besluite opsomming — notule teken besluite op, nie toesprake nie.",
          "Toekomende tyd gebruik in plaas van verlede tyd.",
          "Die aksiepunt en verantwoordelike persoon weglaat na elke besluit."
        ]
      }
    ]
  },

  // ===================== AFRIKAANS HOME LANGUAGE (AFRH) =====================

  "AFRH-1": {
    workedExamplesEn: [
      {
        question: "Write a PEEL paragraph on how the setting shapes the protagonist's choices in the prescribed Afrikaans novel.",
        steps: [
          "Point: state a focused topic sentence linking setting to character choices.",
          "Evidence: quote or reference a specific descriptive passage.",
          "Explain: show the causal link between the described environment and the protagonist's decisions.",
          "Link: connect back to the broader theme or question."
        ],
        solution: "Point: The desolate Karoo setting in the novel imprisons the protagonist as effectively as any physical barrier. Evidence: The narrator describes the landscape as 'eindelose plat blaktes waar die son die pad laat rimpel soos verhitte water'. Explain: This oppressive environment strips the protagonist of practical escape routes — no town, no transport, no witnesses — compelling her to find freedom through internal resistance rather than physical flight. Link: Setting therefore becomes a metaphor for psychological entrapment, deepening the novel's exploration of freedom and agency.",
        commonErrors: [
          "Retelling the plot rather than analysing how setting drives character choices.",
          "Quoting without explaining the causal connection.",
          "Making the link too general ('this shows the theme of the novel')."
        ]
      },
      {
        question: "Compare the protagonist's character at the beginning and end of the novel, using evidence from both points.",
        steps: [
          "Describe the protagonist's key traits, beliefs or behaviour early in the novel with a textual reference.",
          "Describe the protagonist's key traits at the novel's end with a textual reference.",
          "Identify the nature of the change: growth, deterioration, or revelation.",
          "Explain what caused this change (events, relationships, realisations)."
        ],
        solution: "At the outset of the novel, the protagonist is passive and self-effacing — she deflects her husband's cruelty with silence, as seen in her thought 'as ek net stil bly, gaan dit verby'. By the final chapter, her confrontation with the farm owner signals transformation: she speaks in her own voice and accepts the consequences. The change from silence to speech represents a journey from internalised oppression to self-reclamation. The catalyst is her friendship with the older worker Ma Katryn, who models dignified resistance.",
        commonErrors: [
          "Describing only one point in time (beginning or end) when both are required.",
          "Summarising events without linking them to character development.",
          "Identifying the change without explaining its cause."
        ]
      },
      {
        question: "Discuss the theme of memory in the novel using two contrasting examples from the text.",
        steps: [
          "Define how memory functions in the novel (as comfort, burden, distortion, etc.).",
          "Present Example 1: a moment where memory appears in a specific way.",
          "Present Example 2: a contrasting moment where memory functions differently.",
          "Draw a conclusion about what the novel suggests about the nature of memory."
        ],
        solution: "Memory in the novel functions simultaneously as refuge and as prison. Example 1 (comfort): the protagonist revisits her childhood memory of baking with her grandmother whenever the farm's oppression becomes unbearable — the remembered scent of naartjies creates a temporary psychological escape. Example 2 (burden): the same memory becomes distressing in Chapter 12, when she realises the safety of childhood was conditional — her grandmother also 'het geswyg oor die erge dinge'. The novel suggests that memory is not a faithful record but a constructed story we tell ourselves to survive — one that must eventually be confronted honestly.",
        commonErrors: [
          "Presenting two similar examples rather than contrasting ones.",
          "Defining the theme abstractly without grounding it in specific textual moments.",
          "Not reaching a conclusion about what the novel argues about memory."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Skryf 'n PEEL-paragraaf oor hoe die ruimte die protagonis se keuses beïnvloed in die voorgeskrewe Afrikaanse roman.",
        steps: [
          "Punt: stel 'n gefokusde onderwerpsin wat ruimte aan karakter keuses koppel.",
          "Bewys: haal aan of verwys na 'n spesifieke beskrywende gedeelte.",
          "Verduidelik: wys die kousale verband tussen die beskryfde omgewing en die protagonis se besluite.",
          "Skakel: verbind terug na die breër tema of vraag."
        ],
        solution: "Punt: Die verlate Karoo-ruimte in die roman gevangenes die protagonis net so effektief soos enige fisiese versperring. Bewys: 'eindelose plat blaktes waar die son die pad laat rimpel soos verhitte water'. Verduidelik: Hierdie onderdrukkende omgewing ontneem haar praktiese vlugpaaie — geen dorp, geen vervoer, geen getuies — en dwing haar om vryheid deur innerlike weerstand te vind. Skakel: Die ruimte word dus 'n metafoor vir sielkundige gevangeneming.",
        commonErrors: [
          "Die verhaal herhaal eerder as te ontleed hoe die ruimte keuses dryf.",
          "Aanhaal sonder die kousale verband te verduidelik.",
          "Die skakel te algemeen maak."
        ]
      },
      {
        question: "Vergelyk die protagonis se karakter aan die begin en einde van die roman, met bewys van albei punte.",
        steps: [
          "Beskryf die protagonis se sleuteleienskap vroeg in die roman met 'n tekstuele verwysing.",
          "Beskryf die protagonis se sleuteleienskap aan die einde met 'n tekstuele verwysing.",
          "Identifiseer die aard van die verandering: groei, agteruitgang of openbaring.",
          "Verduidelik wat hierdie verandering veroorsaak het."
        ],
        solution: "Vroeg in die roman is die protagonis passief — sy weer haar man se wreedheid af met stilte: 'as ek net stil bly, gaan dit verby'. Teen die finale hoofstuk dui haar konfrontasie met die plaaseienaar transformasie aan: sy praat in haar eie stem. Die verandering van stilte na spraak verteenwoordig 'n reis van geïnternaliseerde onderdrukking na self-herwinning. Die katalisator is haar vriendskap met Ma Katryn.",
        commonErrors: [
          "Slegs een tydpunt beskryf wanneer albei vereis word.",
          "Gebeure opsom sonder om dit aan karakterontwikkeling te koppel.",
          "Die verandering identifiseer sonder die oorsaak te verduidelik."
        ]
      },
      {
        question: "Bespreek die tema van herinnering in die roman met twee kontrasterende voorbeelde uit die teks.",
        steps: [
          "Definieer hoe herinnering in die roman funksioneer.",
          "Bied Voorbeeld 1: 'n moment waar herinnering op 'n spesifieke manier verskyn.",
          "Bied Voorbeeld 2: 'n kontrasterende moment waar herinnering anders funksioneer.",
          "Trek 'n gevolgtrekking oor wat die roman oor die aard van herinnering voorstel."
        ],
        solution: "Herinnering funksioneer gelyktydig as toevlug en as gevangenis. Voorbeeld 1 (troos): die protagonis herbesoek haar kinderjare-herinnering van bak met haar ouma wanneer die plaas se onderdrukking ondraaglik word. Voorbeeld 2 (las): dieselfde herinnering word verontrustend in Hoofstuk 12, wanneer sy besef veiligheid was voorwaardelik — haar ouma 'het ook geswyg oor die erge dinge'. Die roman stel voor dat herinnering nie 'n getroue rekord is nie maar 'n gekonstrueerde verhaal waarmee ons oorleef.",
        commonErrors: [
          "Twee soortgelyke voorbeelde bied eerder as kontrasterende.",
          "Die tema abstrak definieer sonder in spesifieke tekstuele momente te grond.",
          "Nie 'n gevolgtrekking bereik oor wat die roman oor herinnering voorstel nie."
        ]
      }
    ]
  },

  "AFRH-2": {
    workedExamplesEn: [
      {
        question: "Analyse how inner and outer conflict drive the plot of the prescribed Afrikaans drama.",
        steps: [
          "Define inner conflict: a character's internal struggle between competing desires, values or fears.",
          "Define outer conflict: a character's struggle against another person or external force.",
          "Give one textual example of inner conflict with its effect on the character's behaviour.",
          "Give one textual example of outer conflict and show how it intersects with the inner conflict."
        ],
        solution: "Inner conflict: the protagonist is torn between loyalty to her family and her desire for independence — seen when she hesitates before signing the farm papers, the stage direction '[sy staar na die pen, haar hand bewe]' capturing her paralysis. Outer conflict: her father-in-law's explicit ultimatum (Act 2, Scene 3) forces the dilemma into the open. The intersection is crucial: it is the outer conflict that forces resolution of the inner one, driving the climax. Together, they show that the drama's tension is both psychological and social — about personal will and societal expectation.",
        commonErrors: [
          "Describing only outer conflict (visible events) and ignoring inner conflict (psychology).",
          "Listing the conflicts without showing how they connect or drive the plot.",
          "Confusing a character flaw with an inner conflict — a conflict requires two competing pulls."
        ]
      },
      {
        question: "Explain the function of a stage direction in the prescribed Afrikaans drama extract, quoting specifically.",
        steps: [
          "Quote the stage direction exactly.",
          "Explain what physical action or atmosphere it describes.",
          "Analyse what this reveals about character, relationship, or theme.",
          "Note what would be lost if the direction were removed."
        ],
        solution: "Stage direction: '[Pieter draai stadig van haar af, sy skouers sak]'. Physical action: he turns away (rejection/withdrawal) and his shoulders drop (defeat/grief). This reveals Pieter's internal collapse — he cannot face her decision, but his body shows the pain his words suppress. The movement shifts the power balance: she has chosen, and he has accepted it without dignity. Without this direction, readers would only see his silent exit and miss the layers of resigned grief embedded in the physical detail.",
        commonErrors: [
          "Paraphrasing the stage direction without quoting it exactly.",
          "Describing the physical action without analysing its emotional or thematic significance.",
          "Treating stage directions as neutral instructions rather than as authorial meaning-making."
        ]
      },
      {
        question: "Discuss the dramatic importance of a turning point (dramatiese wending) in the prescribed play.",
        steps: [
          "Identify the turning point: the moment when the direction of the plot irreversibly changes.",
          "Describe what happens before and after.",
          "Explain how this change affects the protagonist.",
          "Link the turning point to the play's theme."
        ],
        solution: "The turning point occurs in Act 2 when the protagonist reads the letter revealing her father's deception. Before: she believed her father was trustworthy and her brother's accusations were lies. After: every relationship in the play must be re-evaluated. The protagonist transforms from loyal daughter to independent moral agent — she can no longer shelter in inherited loyalty. The turning point enacts the play's central theme: that truth, once known, cannot be unknown and demands action even at great personal cost.",
        commonErrors: [
          "Choosing a significant event rather than the genuine turning point (a turning point must be irreversible).",
          "Describing the turning point without showing the 'before/after' contrast.",
          "Not connecting the turning point to the play's theme."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Ontleed hoe innerlike en uiterlike konflik die intrige van die voorgeskrewe Afrikaanse drama dryf.",
        steps: [
          "Definieer innerlike konflik en uiterlike konflik.",
          "Gee een tekstuele voorbeeld van innerlike konflik met sy effek op die karakter se gedrag.",
          "Gee een tekstuele voorbeeld van uiterlike konflik en wys hoe dit die innerlike konflik kruis."
        ],
        solution: "Innerlike konflik: die protagonis is geskeur tussen lojaliteit aan haar familie en haar begeerte na onafhanklikheid — '[sy staar na die pen, haar hand bewe]'. Uiterlike konflik: haar skoonvader se ultimatum (Bedryf 2, Toneel 3) dwing die dilemma in die openbaar. Die kruising is krities: die uiterlike konflik dwing resolusie van die innerlike, wat die klimaks dryf.",
        commonErrors: [
          "Slegs uiterlike konflik beskryf en innerlike konflik ignoreer.",
          "Die konflikte lys sonder te wys hoe hulle verbind of die intrige dryf.",
          "'n Karakterfout met 'n innerlike konflik verwar — 'n konflik vereis twee mededingende trekke."
        ]
      },
      {
        question: "Verduidelik die funksie van 'n toneelaanwysing in die voorgeskrewe Afrikaanse drama-uittreksel, met spesifieke aanhaling.",
        steps: [
          "Haal die toneelaanwysing presies aan.",
          "Verduidelik watter fisiese aksie of atmosfeer dit beskryf.",
          "Ontleed wat dit onthul oor karakter, verhouding of tema.",
          "Let op wat verlore sou gaan as die aanwysing verwyder word."
        ],
        solution: "'[Pieter draai stadig van haar af, sy skouers sak]'. Fisiese aksie: hy draai weg (verwerping) en sy skouers sak (neerlaag/droefheid). Dit onthul Pieter se innerlike ineenstorting — hy kan haar beslissing nie in die gesig staar nie, maar sy liggaam wys die pyn wat sy woorde onderdruk. Sonder hierdie aanwysing sou lesers slegs sy stille vertrek sien en die lae van berusting mis.",
        commonErrors: [
          "Die toneelaanwysing parafraseer sonder dit presies te aanhaal.",
          "Die fisiese aksie beskryf sonder die emosionele of tematiese betekenis te ontleed.",
          "Toneelaanwysings as neutrale instruksies behandel."
        ]
      },
      {
        question: "Bespreek die dramatiese belang van 'n dramatiese wending in die voorgeskrewe drama.",
        steps: [
          "Identifiseer die wending: die moment wanneer die rigting van die intrige onherstelbaar verander.",
          "Beskryf wat voor en na die wending gebeur.",
          "Verduidelik hoe hierdie verandering die protagonis affekteer.",
          "Koppel die wending aan die drama se tema."
        ],
        solution: "Die wending vind plaas in Bedryf 2 wanneer die protagonis die brief lees wat haar vader se bedrog onthul. Voor: sy glo haar vader is betroubaar. Na: elke verhouding moet herevalueer word. Die protagonis transformeer van lojale dogter na onafhanklike morele agent. Die wending beliggaam die sentrale tema: dat waarheid, sodra geken, nie ontken kan word nie en aksie vereis.",
        commonErrors: [
          "'n Beduidende gebeurtenis kies eerder as die werklike wending.",
          "Die wending beskryf sonder die voor/na-kontras te wys.",
          "Die wending nie aan die drama se tema koppel nie."
        ]
      }
    ]
  },

  "AFRH-3": {
    workedExamplesEn: [
      {
        question: "Identify the poetic form of the prescribed Afrikaans poem and explain how it contributes to meaning.",
        steps: [
          "Count lines per stanza and total lines to identify the form.",
          "Identify rhyme scheme and metre (if formal).",
          "Name the form if recognisable (sonnet, ballade, vrye vers).",
          "Explain how the form's structure supports or contrasts with the content."
        ],
        solution: "The poem has 14 lines divided into two quatrains and two tercets, with an ABBA ABBA CDC DCD rhyme scheme — identifying it as a Petrarchan sonnet. The octave (8 lines) presents the speaker's problem: unrequited love. The sestet (6 lines) offers no resolution, only deepened longing — violating the conventional Shakespearean sonnet's turn toward resolution. This subversion is deliberate: by using a traditionally 'resolved' form to explore unresolved pain, the poet suggests that love's complexity resists tidy conclusions.",
        commonErrors: [
          "Counting lines incorrectly and misidentifying the form.",
          "Identifying the form but treating it as incidental rather than showing how it shapes meaning.",
          "Confusing Petrarchan and Shakespearean sonnet structures."
        ]
      },
      {
        question: "Analyse the use of symbolism in the prescribed Afrikaans poem, identifying one symbol and tracing its development.",
        steps: [
          "Identify a symbol (an object, image, or action that carries deeper meaning beyond its literal sense).",
          "Show where it first appears in the poem.",
          "Trace how its meaning develops or shifts across stanzas.",
          "State what the symbol ultimately represents thematically."
        ],
        solution: "Symbol: the wagon wheel (waentjiewiel). First appearance: stanza 1 — the speaker sees it lying abandoned in the field, initially presented as a neutral image. Development: in stanza 3, the wheel becomes the speaker's own life — 'gebreek soos 'n waentjiewiel wat niemand meer herstel nie' — transforming into a symbol of neglect and irreparability. Final meaning: the wheel represents broken things that society passes without stopping to repair — implicitly arguing for attention to the abandoned and forgotten. The symbol is effective because its development is gradual, allowing the emotional weight to accumulate.",
        commonErrors: [
          "Identifying a theme instead of a symbol (a symbol is a concrete image, not an abstract idea).",
          "Tracing the symbol only in one stanza rather than across the whole poem.",
          "Stating what the symbol means without showing how meaning is built through the poem."
        ]
      },
      {
        question: "Explain how alliteration and assonance work together in a stanza of the prescribed Afrikaans poem.",
        steps: [
          "Quote the stanza.",
          "Identify specific alliteration: repeated initial consonant sounds.",
          "Identify specific assonance: repeated vowel sounds within words.",
          "Explain the combined sonic effect and its relationship to meaning."
        ],
        solution: "Stanza: 'Die sand suig sag aan elke stap / en die see se asem suig ons slapend in'. Alliteration: 's' repeated — 'sand', 'suig', 'sag', 'stap', 'see', 'suig'. Assonance: 'a' sounds — 'sand', 'sag', 'stap', 'slapend'. The repeated sibilant 's' creates a soft, hissing sound that mimics the sea's pull and the sound of sand underfoot. The 'a' assonance slows the reading rhythm, replicating the heaviness of walking in sand. Together, the sound devices create an immersive auditory experience that places the reader physically in the coastal scene.",
        commonErrors: [
          "Confusing alliteration (initial consonants) with consonance (consonants anywhere in the word).",
          "Identifying the devices without linking them to the poem's sonic or thematic effect.",
          "Treating assonance as rhyme — assonance is internal vowel repetition, not end-word rhyme."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Identifiseer die poëtiese vorm van die voorgeskrewe Afrikaanse gedig en verduidelik hoe dit by betekenis bydra.",
        steps: [
          "Tel reëls per strofe en totale reëls om die vorm te identifiseer.",
          "Identifiseer die rymskema en maat.",
          "Noem die vorm as dit herkenbaar is.",
          "Verduidelik hoe die vorm se struktuur die inhoud ondersteun of kontrasteer."
        ],
        solution: "Die gedig het 14 reëls in twee kwatraine en twee terset, met ABBA ABBA CDC DCD-rymskema — wat dit as 'n Petrarcaanse sonnet identifiseer. Die oktaaf stel die spreker se probleem voor: onbeantwoorde liefde. Die sestet bied geen resolusie nie — wat die tradisionele sonnet-wending omkeer. Deur 'n tradisioneel 'opgelos' vorm te gebruik vir onopgeloste pyn, stel die digter voor dat liefde se kompleksiteit netjiese gevolgtrekkings weerstaan.",
        commonErrors: [
          "Reëls foutief tel en die vorm verkeerd identifiseer.",
          "Die vorm identifiseer sonder te wys hoe dit betekenis vorm.",
          "Petrarcaanse en Shakespeariese sonnet-strukture verwar."
        ]
      },
      {
        question: "Ontleed die gebruik van simbolisme in die voorgeskrewe Afrikaanse gedig, met identifisering van een simbool.",
        steps: [
          "Identifiseer 'n simbool (iets konkreets met dieper betekenis).",
          "Wys waar dit eerste verskyn.",
          "Volg hoe die betekenis oor strofes ontwikkel of verskuif.",
          "Stel wat die simbool uiteindelik tematies verteenwoordig."
        ],
        solution: "Simbool: die waentjiewiel. Eerste verskyning: strofe 1 — neutraal voorgestel. Ontwikkeling: strofe 3 — die wiel word die spreker se lewe: 'gebreek soos 'n waentjiewiel wat niemand meer herstel nie' — 'n simbool van verwaarlosing en onherstelbaarheid. Finale betekenis: die wiel verteenwoordig gebreekte dinge wat die samelewing verbygaan sonder om te herstel.",
        commonErrors: [
          "'n Tema identifiseer in plaas van 'n simbool — 'n simbool is 'n konkrete beeld.",
          "Die simbool slegs in een strofe volg eerder as deur die hele gedig.",
          "Sê wat die simbool beteken sonder te wys hoe betekenis gebou word."
        ]
      },
      {
        question: "Verduidelik hoe alliterasie en assonansie saamwerk in 'n strofe van die voorgeskrewe Afrikaanse gedig.",
        steps: [
          "Haal die strofe aan.",
          "Identifiseer spesifieke alliterasie: herhaalde aanvangsklinkers.",
          "Identifiseer spesifieke assonansie: herhaalde vokaalklank binne woorde.",
          "Verduidelik die gekombineerde klankeffek en verhouding met betekenis."
        ],
        solution: "'Die sand suig sag aan elke stap / en die see se asem suig ons slapend in'. Alliterasie: 's' herhaal — 'sand', 'suig', 'sag', 'stap', 'see'. Assonansie: 'a'-klanke — 'sand', 'sag', 'stap', 'slapend'. Die herhaalde sibilante 's' mim die see se aantrekkingskrag. Die 'a'-assonansie vertraag die leesritme, wat die swaarigheid van stap in sand naboots.",
        commonErrors: [
          "Alliterasie (aanvangsklinkers) met konsonansie (klinkers orals) verwar.",
          "Die toestelle identifiseer sonder aan die klank- of tematiese effek te koppel.",
          "Assonansie as rym behandel — dit is interne vokaalherhalings, nie eindwoord-rym nie."
        ]
      }
    ]
  },

  "AFRH-4": {
    workedExamplesEn: [
      {
        question: "Analyse how unity of effect is achieved in the prescribed Afrikaans short story.",
        steps: [
          "Identify the dominant effect (the single emotional impression) the story creates.",
          "Show how the opening lines establish this effect.",
          "Trace two more elements (setting, characterisation, or dialogue) that reinforce it.",
          "Explain how the ending crystallises the effect."
        ],
        solution: "Dominant effect: suffocating guilt. Opening: 'Die kamer ruik nog na hom' — present tense and sensory detail immediately implicates the narrator in someone's loss. Setting: the closed, unchanged room reinforces stagnation. Dialogue: the protagonist's clipped responses to her daughter avoid the subject of the dead husband, creating suppressed guilt. Ending: her gesture of opening the window — symbolic ventilation — cannot release the guilt because the smell remains. The story achieves unity by making every element contribute to the sense of unresolved responsibility.",
        commonErrors: [
          "Identifying a theme rather than a specific emotional effect.",
          "Listing story elements without showing how each one contributes to the dominant effect.",
          "Analysing the ending in isolation rather than as a crystallisation of the effect built throughout."
        ]
      },
      {
        question: "Discuss the role of the narrator's perspective in shaping reader sympathy in the story.",
        steps: [
          "Identify the type of narrator (first or third, reliable or unreliable).",
          "Show what information the narrator has or lacks.",
          "Give one example of where the perspective creates sympathy for the narrator.",
          "Give one example of where the perspective limits the reader's sympathy."
        ],
        solution: "The story uses a first-person narrator who is the grieving son. His perspective creates sympathy: we feel his confusion when he describes his mother's silences — 'Sy praat net as sy moet'. However, his perspective is limited — he cannot access his mother's grief, which occasionally surfaces in her actions but never in her words. This limitation creates a second layer of sympathy: we pity the mother whose internal world is invisible to the narrator who tells us the story. The perspective thus creates a layered sympathy impossible with omniscient narration.",
        commonErrors: [
          "Conflating sympathy with liking — we can have sympathy for characters we dislike.",
          "Discussing perspective in abstract without showing how it concretely shapes the reader's response.",
          "Forgetting to show both the narrator's sympathy and its limits."
        ]
      },
      {
        question: "Explain how the title of the short story functions as a key to its meaning.",
        steps: [
          "State the title.",
          "Offer its literal meaning.",
          "Offer its symbolic or thematic meaning.",
          "Show where in the story the title's deeper meaning is most clearly enacted."
        ],
        solution: "Title: 'Die Laaste Brief'. Literal meaning: the final letter (communication). Symbolic meaning: the letter represents all the unspoken words between father and son — an opportunity for honesty that the father chose not to use while alive. The title's full meaning emerges in the final scene when the son discovers the letter unposted in his father's desk drawer: it was written but never sent — suggesting the father's inability to bridge the emotional silence that defined their relationship. The title thus encapsulates the story's central tragedy: communication attempted but withheld.",
        commonErrors: [
          "Offering only the literal meaning without exploring symbolic significance.",
          "Not grounding the symbolic meaning in a specific story moment.",
          "Choosing a generic theme ('communication is important') rather than a meaning specific to this text."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Ontleed hoe eenheid van effek in die voorgeskrewe Afrikaanse kortverhaal bereik word.",
        steps: [
          "Identifiseer die dominante effek wat die verhaal skep.",
          "Wys hoe die openingsreëls hierdie effek vestig.",
          "Volg twee meer elemente wat dit versterk.",
          "Verduidelik hoe die einde die effek kristalliseer."
        ],
        solution: "Dominante effek: verstikkende skuld. Opening: 'Die kamer ruik nog na hom' — teenwoordige tyd en sintuiglike besonderheid impliseer die verteller direk. Ruimte: die geslote, onveranderde kamer versterk stagnasie. Dialoog: die protagonis se beknopte antwoorde vermy die onderwerp van die dooie man. Einde: haar gebaar om die venster oop te maak kan die skuld nie vrystel nie, want die reuk bly. Die verhaal bereik eenheid deur elke element by te laat dra tot onopgeloste verantwoordelikheid.",
        commonErrors: [
          "'n Tema eerder as 'n spesifieke emosionele effek identifiseer.",
          "Verhaalelemente lys sonder te wys hoe elkeen tot die dominante effek bydra.",
          "Die einde in isolasie ontleed."
        ]
      },
      {
        question: "Bespreek die rol van die verteller se perspektief in die vorming van leser-simpatie in die verhaal.",
        steps: [
          "Identifiseer die tipe verteller.",
          "Wys watter inligting die verteller het of ontbreek.",
          "Gee een voorbeeld waar die perspektief simpatie vir die verteller skep.",
          "Gee een voorbeeld waar die perspektief die leser se simpatie beperk."
        ],
        solution: "Die verhaal gebruik 'n eerstepersoons-verteller: die treurende seun. Sy perspektief skep simpatie: ons voel sy verwarring wanneer hy sy moeder se stiltes beskryf. Maar sy perspektief is beperk — hy kan nie sy moeder se smart bereik nie. Hierdie beperking skep 'n tweede laag van simpatie: ons beklaag die moeder wie se innerlike wêreld onsigbaar is. Die perspektief skep gelaagde simpatie onmoontlik met alwetende vertelling.",
        commonErrors: [
          "Simpatie met simpatie verwar — ons kan simpatie hê vir karakters wat ons nie hou van nie.",
          "Perspektief abstrak bespreek sonder te wys hoe dit die leserreaksie konkreet vorm.",
          "Vergeet om beide die verteller se simpatie en sy beperkings te wys."
        ]
      },
      {
        question: "Verduidelik hoe die titel van die kortverhaal as 'n sleutel tot sy betekenis funksioneer.",
        steps: [
          "Stel die titel.",
          "Bied sy letterlike betekenis.",
          "Bied sy simboliese of tematiese betekenis.",
          "Wys waar in die verhaal die titel se dieper betekenis die duidelikste beliggaam word."
        ],
        solution: "Titel: 'Die Laaste Brief'. Letterlike betekenis: die finale brief (kommunikasie). Simboliese betekenis: die brief verteenwoordig al die ongesegde woorde tussen vader en seun. Die titel se volle betekenis ontluik in die finale toneel wanneer die seun die brief onagestuur in sy vader se lessenaar-laai ontdek — wat die vader se onvermoë om die emosionele stilte te oorbrug voorstel. Die titel vat die sentrale tragedie saam: kommunikasie gepoging maar weerhou.",
        commonErrors: [
          "Slegs die letterlike betekenis bied sonder simboliese betekenis te verken.",
          "Die simboliese betekenis nie in 'n spesifieke verhaalmoment grond nie.",
          "'n Generiese tema kies eerder as 'n betekenis spesifiek aan hierdie teks."
        ]
      }
    ]
  },

  "AFRH-5": {
    workedExamplesEn: [
      {
        question: "Change the following sentence from active to passive voice in Afrikaans: 'Die seun het die venster gebreek.'",
        steps: [
          "Identify the subject (die seun), verb (het gebreek), and object (die venster).",
          "The object becomes the new subject: 'Die venster'.",
          "Form the passive verb: 'is/was' + past participle → 'is gebreek'.",
          "Add 'deur die seun' if the agent is important."
        ],
        solution: "Die venster is deur die seun gebreek. Note: in Afrikaans the passive is formed with 'is' (for present/recent past) or 'was' (for more distant past). The agent ('deur die seun') can be omitted if unknown or unimportant: 'Die venster is gebreek.'",
        commonErrors: [
          "Using 'het gebreek word' — Afrikaans does not form passive this way.",
          "Keeping the original subject in subject position: 'Die seun is gebreek'.",
          "Using 'was' for recent events — 'is' is generally preferred for current/recent past."
        ]
      },
      {
        question: "Transform this direct speech into indirect speech: Hy het gesê: 'Ek is moeg en wil huis toe gaan.'",
        steps: [
          "Change the reporting verb tense: 'het gesê' triggers backshift.",
          "Backshift: 'is' → 'was'; 'wil' → 'wou'.",
          "Shift pronouns: 'Ek' → 'hy'.",
          "Remove quotation marks and comma; add 'dat' (optional in Afrikaans)."
        ],
        solution: "Hy het gesê dat hy moeg was en huis toe wou gaan. Key changes: 'is' → 'was'; 'wil' → 'wou'; 'Ek' → 'hy'; quotation marks removed.",
        commonErrors: [
          "Keeping 'is' instead of backshifting to 'was'.",
          "Keeping 'wil' instead of changing to 'wou'.",
          "Keeping the first-person pronoun: 'hy het gesê ek is moeg'."
        ]
      },
      {
        question: "Identify the clause type (hoofsin / bysin) in the following and write a sentence using each: 'want / maar / of'.",
        steps: [
          "Identify 'want', 'maar', 'of' as co-ordinating conjunctions (neweskikkende voegwoorde).",
          "Explain that these join two main clauses (hoofsinne) of equal status.",
          "Write a sentence with each, showing the word order (no inversion after these three).",
          "Contrast with a subordinating conjunction (onderskikkende voegwoord) that triggers inversion."
        ],
        solution: "'Want', 'maar', 'of' are co-ordinating conjunctions — they join two main clauses without changing word order. Examples: 'Hy kom nie, want hy is siek.' / 'Sy het gevra, maar niemand het geantwoord nie.' / 'Kom jy, of bly jy tuis?' Contrast: subordinating conjunction 'omdat' triggers subject-verb inversion in the sub-clause: 'Hy bly tuis omdat hy siek is.' (verb moved to end).",
        commonErrors: [
          "Inverting word order after 'want' or 'maar' — these do NOT cause inversion.",
          "Confusing 'omdat' (subordinating) with 'want' (co-ordinating) — they are not interchangeable.",
          "Omitting the double negation ('nie...nie') required in Afrikaans negative sentences."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verander die volgende sin van aktief na passief in Afrikaans: 'Die seun het die venster gebreek.'",
        steps: [
          "Identifiseer die onderwerp, werkwoord en voorwerp.",
          "Die voorwerp word die nuwe onderwerp: 'Die venster'.",
          "Vorm die passiewe werkwoord: 'is' + verlede deelwoord.",
          "Voeg 'deur die seun' by indien die agent belangrik is."
        ],
        solution: "Die venster is deur die seun gebreek. Let op: in Afrikaans word die passief met 'is' (hede/onlangse verlede) of 'was' (verre verlede) gevorm. Die agent kan weggelaat word: 'Die venster is gebreek.'",
        commonErrors: [
          "'Het gebreek word' gebruik — Afrikaans vorm nie passief op hierdie manier nie.",
          "Die oorspronklike onderwerp in subjekposisie hou.",
          "'Was' vir onlangse gebeure gebruik — 'is' is in die algemeen voorkeur."
        ]
      },
      {
        question: "Verander hierdie direkte rede na indirekte rede: Hy het gesê: 'Ek is moeg en wil huis toe gaan.'",
        steps: [
          "Verander die rapporteringswerkwoord tyd: 'het gesê' aktiveer terugverskuiwing.",
          "Terugverskuiwing: 'is' → 'was'; 'wil' → 'wou'.",
          "Verskuif voornaamwoorde: 'Ek' → 'hy'.",
          "Verwyder aanhalingstekens en komma; voeg 'dat' by (opsioneel)."
        ],
        solution: "Hy het gesê dat hy moeg was en huis toe wou gaan. Sleutelveranderinge: 'is' → 'was'; 'wil' → 'wou'; 'Ek' → 'hy'; aanhalingstekens verwyder.",
        commonErrors: [
          "'Is' hou in plaas van terugverskuiwing na 'was'.",
          "'Wil' hou in plaas van 'wou'.",
          "Die eerstepersoon voornaamwoord hou."
        ]
      },
      {
        question: "Identifiseer die sinsoort (hoofsin / bysin) en skryf 'n sin met elk van: 'want / maar / of'.",
        steps: [
          "Identifiseer 'want', 'maar', 'of' as neweskikkende voegwoorde.",
          "Verduidelik dat hierdie twee hoofsinne van gelyke status verbind.",
          "Skryf 'n sin met elk, wat woordorde wys (geen inversie na hierdie drie nie).",
          "Kontrasteer met 'n onderskikkende voegwoord wat inversie veroorsaak."
        ],
        solution: "'Want', 'maar', 'of' is neweskikkende voegwoorde — hulle verbind twee hoofsinne sonder woordorde te verander. Voorbeelde: 'Hy kom nie, want hy is siek.' / 'Sy het gevra, maar niemand het geantwoord nie.' / 'Kom jy, of bly jy tuis?' Kontras: onderskikkende voegwoord 'omdat' veroorsaak inversie: 'Hy bly tuis omdat hy siek is.'",
        commonErrors: [
          "Woordorde omgooi na 'want' of 'maar' — hierdie veroorsaak GEEN inversie nie.",
          "'Omdat' (onderskikkend) met 'want' (neweskikkend) verwar.",
          "Die dubbele negasie ('nie...nie') in Afrikaanse negatiewe sinne weglaat."
        ]
      }
    ]
  },

  "AFRH-6": {
    workedExamplesEn: [
      {
        question: "Write a 7-point summary of a passage about the impact of technology on Afrikaans language use, in no more than 70 words.",
        steps: [
          "Skim the passage to identify topic and argument.",
          "Read paragraph by paragraph and note the key idea of each.",
          "Select the 7 most important ideas (not supporting details).",
          "Write each idea in a full sentence in your own words; total ≤70 words."
        ],
        solution: "Process: identify 7 main ideas from each paragraph without quoting directly. Check: (1) Are all 7 ideas distinct? (2) Is each written in a complete sentence? (3) Are all in your own words? (4) Is the total under 70 words? Model summary: 'Technology affects Afrikaans in seven ways: SMS spelling shortens words; English dominates digital platforms; autocorrect replaces correct spelling; young speakers prefer English online; Afrikaans apps are scarce; formal registers disappear in digital spaces; and some advocate for Afrikaans-only digital communities.'",
        commonErrors: [
          "Copying sentences from the passage — the examiner requires your own words.",
          "Including examples or statistics as main points — these are supporting details.",
          "Going over 70 words — every word beyond the limit may cost marks."
        ]
      },
      {
        question: "Distinguish between the denotative and connotative meaning of a word in context.",
        steps: [
          "Define denotation: the literal, dictionary meaning of a word.",
          "Define connotation: the emotional, cultural, or evaluative associations a word carries.",
          "Choose a word from the passage.",
          "State its denotation, then explain its connotations in context."
        ],
        solution: "Word: 'huis' ('home'). Denotation: a physical building where people live. Connotation: warmth, safety, belonging, family — emotionally loaded in Afrikaans culture due to the centrality of the home in Afrikaner identity narratives. In the passage, 'huis' is used in the context of forced removals, where its connotations of safety are violently disrupted — making the word's usage deliberately ironic: a word associated with security used in the context of its destruction.",
        commonErrors: [
          "Using 'connotation' and 'denotation' interchangeably.",
          "Discussing connotation in general without anchoring it to the specific context of the passage.",
          "Choosing a word with no interesting connotative complexity (e.g. 'die', 'en')."
        ]
      },
      {
        question: "Identify the writer's purpose and intended audience in a given Afrikaans text, with textual evidence.",
        steps: [
          "Consider purpose: to inform, persuade, entertain, warn, instruct, celebrate?",
          "Consider audience: who is being addressed based on vocabulary level, assumed knowledge, and examples chosen?",
          "Find textual evidence for both.",
          "Explain why purpose and audience are aligned or whether there is tension."
        ],
        solution: "Purpose: to persuade. Evidence: 'Ons moet nou optree, anders verloor ons ons taal vir altyd' — imperative language ('moet'), urgency ('nou'), and emotional appeal ('vir altyd') mark this as persuasive writing. Audience: educated, concerned Afrikaans speakers. Evidence: technical vocabulary ('digitalisering', 'kommersialisering') assumes familiarity; first-person plural ('ons') creates in-group solidarity. Purpose and audience are aligned — the persuasive urgency works because the assumed audience already cares about language preservation.",
        commonErrors: [
          "Stating purpose without providing textual evidence for it.",
          "Guessing audience demographics without connecting to specific vocabulary or rhetorical choices.",
          "Treating purpose as fixed — some texts blend purposes (e.g. inform while persuading)."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Skryf 'n 7-punt opsomming van 'n teks oor die impak van tegnologie op Afrikaans, in nie meer as 70 woorde nie.",
        steps: [
          "Skim die teks om die tema te identifiseer.",
          "Lees paragraaf vir paragraaf en let op die sleutelgedagte van elk.",
          "Kies die 7 belangrikste gedagtes.",
          "Skryf elke gedagte in 'n volsin in eie woorde; totaal ≤70 woorde."
        ],
        solution: "Proses: identifiseer 7 hoofgedagtes sonder direkte aanhaling. Modelopsomming: 'Tegnologie beïnvloed Afrikaans op sewe maniere: SMS-spelling verkort woorde; Engels domineer digitale platforms; outokorreksie vervang korrekte spelling; jong sprekers verkies Engels aanlyn; Afrikaanse toepassings is skaars; formele registers verdwyn in digitale ruimtes; en sommige bepleit Afrikaans-slegs digitale gemeenskappe.'",
        commonErrors: [
          "Sinne uit die teks kopieer — eie woorde word vereis.",
          "Voorbeelde of statistieke as hoofpunte insluit.",
          "70 woorde oorskry."
        ]
      },
      {
        question: "Onderskei tussen die denotatiewe en konnotatiewe betekenis van 'n woord in konteks.",
        steps: [
          "Definieer denotasie: die letterlike, woordeboekbetekenis.",
          "Definieer konnotasie: die emosionele, kulturele of evaluatiewe assosiasies.",
          "Kies 'n woord uit die teks.",
          "Stel die denotasie, dan verduidelik die konnotasies in konteks."
        ],
        solution: "Woord: 'huis'. Denotasie: 'n fisiese gebou waar mense woon. Konnotasie: warmte, veiligheid, behoort, gesin — emosioneel gelaai in Afrikaanse kultuur. In die teks word 'huis' in die konteks van gedwonge verskuiwings gebruik, waar die konnotasies van veiligheid gewelddadig versteur word — wat die woord se gebruik doelbewus ironies maak.",
        commonErrors: [
          "'Konnotasie' en 'denotasie' afwisselend gebruik.",
          "Konnotasie in die algemeen bespreek sonder om dit in die spesifieke konteks te anker.",
          "'n Woord kies sonder interessante konnotatiewe kompleksiteit."
        ]
      },
      {
        question: "Identifiseer die skrywer se doel en beoogde gehoor in 'n gegewe Afrikaanse teks, met tekstuele bewys.",
        steps: [
          "Oorweeg doel: om in te lig, te oorreed, te vermaak, te waarsku?",
          "Oorweeg gehoor: wie word aangespreek op grond van woordeskat, aangenome kennis en gekose voorbeelde?",
          "Vind tekstuele bewys vir albei.",
          "Verduidelik waarom doel en gehoor ooreenstem of in spanning is."
        ],
        solution: "Doel: om te oorreed. Bewys: 'Ons moet nou optree, anders verloor ons ons taal vir altyd' — gebiedende taal ('moet'), dringendheid ('nou'), emosionele appèl ('vir altyd'). Gehoor: opgevoede, besorgde Afrikaanssprekers. Bewys: tegniese woordeskat ('digitalisering') aanvaar vertroudheid; eerstepersoon meervoud ('ons') skep in-groep solidariteit.",
        commonErrors: [
          "Doel stel sonder tekstuele bewys.",
          "Gehoor raai sonder spesifieke woordeskat of retoriese keuses te koppel.",
          "Doel as vas behandel — sommige tekste meng doelwitte."
        ]
      }
    ]
  },

  "AFRH-7": {
    workedExamplesEn: [
      {
        question: "Write a thesis statement for an argumentative essay: 'Skooltelevisie doen meer skade as goed.'",
        steps: [
          "Choose your stance: agree, disagree, or partially agree.",
          "Preview 2-3 main arguments.",
          "Combine in one complex sentence with a concessive clause if partially agreeing."
        ],
        solution: "Thesis (agreeing): 'Alhoewel skooltelevisie somtyds opvoedkundige waarde bied, doen dit meer skade as goed deur leerders se konsentrasie te kortwiek, passiewe leer aan te moedig en klaskamerdissipline te ondermyn.'",
        commonErrors: [
          "Skryf 'n feit: 'Skooltelevisie word gebruik in baie skole' — dit is onbetwisbaar.",
          "Te vaag: 'Skooltelevisie is sleg' — geen argumente voorskouend.",
          "'n Vraag as tesisstelling skryf."
        ]
      },
      {
        question: "Plan and write a PEEL paragraph for: 'Alle skoolkinders behoort skooltelevisie te kyk.'",
        steps: [
          "Punt: duidelike onderwerpsin.",
          "Bewys: feit, statistiek of voorbeeld.",
          "Verduidelik: pak die bewys uit.",
          "Skakel: koppel terug na die tesisstelling."
        ],
        solution: "P: Skooltelevisie versterk leer deur visuele hulpmiddels te bied wat vir verskillende leerstyle toeganklik is. B: 'n Studie deur die SAKO (2021) het bevind dat leerders wat visuele supplementêre materiaal gebruik 23% beter in begripstoetse presteer. V: Wanneer komplekse konsepte visueel voorgestel word, word abstrakte idees konkreet — wat leer vir kinestetiese en visuele leerders toeganklik maak. S: Skooltelevisie, as opvoedkundige hulpmiddel, verhoog dus leeruitkomste.",
        commonErrors: [
          "Slegs 'PB' skryf sonder die verduideliking.",
          "Die skakelsin vergeet.",
          "Swak of onverifieerbare bewys kies."
        ]
      },
      {
        question: "Write a strong introduction for a reflective essay: 'Die oomblik wat alles verander het.'",
        steps: [
          "Haak: begin met 'n beeld of treffer besonderheid.",
          "Konteks: stel die situasie kortliks voor.",
          "Fokus: dui die dominante ervaring of besinning aan.",
          "Hou tot 5-7 sinne."
        ],
        solution: "Dit was 'n gewone Dinsdag. Die klas was besig met Wiskunde, die son het deur die stowwerige ruite gevloei, en die onderwyseres se stem het gedruis soos 'n trein wat ver verby is. En toe: 'n enkele sin, amper terloops geuiter, wat my wêreld herrangskik het. Hierdie opstel besin oor die oomblik wat ek besef het dat ek nog nooit werklik na myself geluister het nie — en hoe die herkenning van daai stilte alles wat daarna gekom het, gevorm het.",
        commonErrors: [
          "Begin met 'n woordeboekdefinisie.",
          "'n Narratiewe inleiding skryf wanneer 'n refleksiewe fokus vereis word.",
          "Te veel in die inleiding onthul."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Skryf 'n tesisstelling vir 'n betogende opstel: 'Skooltelevisie doen meer skade as goed.'",
        steps: [
          "Kies jou standpunt.",
          "Sien vooruit 2-3 hoofargumente.",
          "Kombineer in een komplekse sin."
        ],
        solution: "Tesisstelling (saamstem): 'Alhoewel skooltelevisie somtyds opvoedkundige waarde bied, doen dit meer skade as goed deur konsentrasie te kortwiek, passiewe leer aan te moedig en klassipline te ondermyn.'",
        commonErrors: [
          "'n Feit as tesisstelling skryf.",
          "Te vaag wees.",
          "'n Vraag as tesisstelling skryf."
        ]
      },
      {
        question: "Beplan en skryf 'n PEEL-paragraaf vir: 'Alle skoolkinders behoort skooltelevisie te kyk.'",
        steps: [
          "Punt: duidelike onderwerpsin.",
          "Bewys: feit, statistiek of voorbeeld.",
          "Verduidelik: pak die bewys uit.",
          "Skakel: koppel terug."
        ],
        solution: "P: Skooltelevisie versterk leer deur visuele hulpmiddels te bied. B: SAKO-studie (2021): leerders wat visuele materiaal gebruik presteer 23% beter. V: Abstrakte idees word konkreet wanneer visueel voorgestel. S: Skooltelevisie verhoog leeruitkomste.",
        commonErrors: [
          "Slegs 'PB' skryf sonder die verduideliking.",
          "Die skakelsin vergeet.",
          "Swak bewys kies."
        ]
      },
      {
        question: "Skryf 'n sterk inleiding vir 'n refleksiewe opstel: 'Die oomblik wat alles verander het.'",
        steps: [
          "Haak: begin met 'n beeld.",
          "Konteks: stel die situasie kortliks voor.",
          "Fokus: dui die dominante besinning aan.",
          "Hou tot 5-7 sinne."
        ],
        solution: "Dit was 'n gewone Dinsdag. Die klas was besig, die son het gevloei, en die onderwyseres se stem het gedruis. En toe: 'n enkele sin wat my wêreld herrangskik het. Hierdie opstel besin oor die oomblik wat ek besef het ek het nog nooit na myself geluister nie.",
        commonErrors: [
          "Begin met 'n woordeboekdefinisie.",
          "'n Narratiewe inleiding skryf wanneer refleksie vereis word.",
          "Te veel in die inleiding onthul."
        ]
      }
    ]
  },

  "AFRH-8": {
    workedExamplesEn: [
      {
        question: "Write a formal complaint letter in Afrikaans about a defective product.",
        steps: [
          "Correct layout: your address, date, recipient's address, 'Geagte Meneer/Mevrou'.",
          "Paragraph 1: state the complaint and product details.",
          "Paragraph 2: describe the problem and its impact.",
          "Paragraph 3: state what resolution you expect.",
          "Close with 'Die uwe'."
        ],
        solution: "14 Rooibok Street / Bloemfontein / 9301 / 25 Mei 2026 // Kliëntediens / TechMart SA / Privaatsak X / Johannesburg 2001 // Geagte Meneer/Mevrou // Op 10 Mei 2026 het ek 'n skootrekenaar (Model X-5, serienommer 4839201) by u winkel gekoop. Binne drie dae het die skerm begin flicker en naderhand heeltemal geweier om te werk. // Hierdie fout het my ernstig benadeel aangesien ek die rekenaar vir skoolwerk benodig het. // Ek versoek dringend 'n volledige terugbetaling of 'n vervangingseenheid binne 7 werkdae. // Die uwe / [Handtekening] / N. Motaung",
        commonErrors: [
          "Met 'Met vriendelike groete' sluit wanneer die ontvanger onbekend is.",
          "Die klant se produkbesonderhede (serienommer, aankoopdatum) weglaat.",
          "Informele taal gebruik: 'Die ding is gebreek en ek is baie kwaad'."
        ]
      },
      {
        question: "Write a diary entry in Afrikaans recording a significant personal experience.",
        steps: [
          "Format: 'Liewe Dagboek' or just the date; informal register is appropriate.",
          "Record the event, your feelings about it, and your reflections.",
          "Use first-person and past tense for events; present tense for current feelings.",
          "End with a forward-looking thought or resolution."
        ],
        solution: "Dinsdag, 25 Mei 2026 / Liewe Dagboek, / Vandag was nie soos enige ander dag nie. Ek het vroeg opgestaan, vol verwagting — en die dag het my nie teleurgestel nie. My pa het my by die skool gaan haal en vir die eerste keer in jare het ons gepraat, regtig gepraat. Hy het vertel van sy eie skoolfoute, en ek het besef hy was eendag ook net 'n kind. Ek gaan hierdie dag lank onthou. Miskien is dit die begin van iets nuuts.",
        commonErrors: [
          "'n Formele register gebruik — 'n dagboekinskrywing is persoonlik en informeel.",
          "Gebeure lys sonder te reflekteer — 'n dagboek bevat emosies en gedagtes, nie net 'n lys van gebeure.",
          "Die datum en aanspreekvorm ('Liewe Dagboek') weglaat."
        ]
      },
      {
        question: "Write an advertisement in Afrikaans for a school fundraiser.",
        steps: [
          "Catchy headline that names the event.",
          "Key details: date, time, venue, price, contact.",
          "Persuasive language: benefits, special features, call to action.",
          "Keep it brief and visual in layout (bullet points acceptable)."
        ],
        solution: "🎂 GROOT KOEKVERKOPING — KOELENHOF HOËR 🎂 // Wanneer: Vrydag, 6 Junie 2026 | Plek: Skoolsaal | Tyd: 12:00–14:00 // Geniet tuisgemaakte lekkernye teen onklopbare pryse! Alle opbrengste gaan na ons nuwe biblioteek. Spesiale items: vetkoek, malvapoeding, sjokoladekoek. Kontak: skoolfonds@koelenhof.ac.za // BRING JOU FAMILIEI — BRING JOU APTYT! // 'n Skool wat bak, is 'n skool wat gee.",
        commonErrors: [
          "Weglaat sleutelbesonderhede (datum, tyd, plek) — 'n advertensie moet die praktiese inligting gee.",
          "'n Formele of tegniese register gebruik — advertensies moet pakkend en toeganklik wees.",
          "Geen aksie-oproepe ('Kom!' / 'Bring jou gesin!') — 'n advertensie moet die gehoor aanmoedig om te reageer."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Skryf 'n formele klagte-brief in Afrikaans oor 'n gebrekkige produk.",
        steps: [
          "Korrekte uitleg: jou adres, datum, ontvanger se adres, 'Geagte Meneer/Mevrou'.",
          "Paragraaf 1: stel die klagte en produkbesonderhede.",
          "Paragraaf 2: beskryf die probleem en impak.",
          "Paragraaf 3: stel watter resolusie jy verwag.",
          "Sluit met 'Die uwe'."
        ],
        solution: "14 Rooibokstraat / Bloemfontein / 9301 / 25 Mei 2026 // Kliëntediens / TechMart SA / Privaatsak X / Johannesburg 2001 // Geagte Meneer/Mevrou // Op 10 Mei 2026 het ek 'n skootrekenaar (Model X-5, serienommer 4839201) by u winkel gekoop. Binne drie dae het die skerm begin flicker. // Hierdie fout het my ernstig benadeel. // Ek versoek 'n volledige terugbetaling of 'n vervanging binne 7 werkdae. // Die uwe / N. Motaung",
        commonErrors: [
          "Met 'Met vriendelike groete' sluit wanneer die ontvanger onbekend is.",
          "Produkbesonderhede weglaat.",
          "Informele taal gebruik."
        ]
      },
      {
        question: "Skryf 'n dagboekinskrywing in Afrikaans wat 'n beduidende persoonlike ervaring opteken.",
        steps: [
          "Formaat: 'Liewe Dagboek' of slegs die datum; informele register.",
          "Teken die gebeure op, jou gevoelens en refleksies.",
          "Gebruik eerstepersoon en verlede tyd vir gebeure; teenwoordige tyd vir huidige gevoelens.",
          "Eindig met 'n vooruitskouende gedagte."
        ],
        solution: "Dinsdag, 25 Mei 2026 / Liewe Dagboek, / Vandag was nie soos enige ander dag nie. My pa het my gaan haal en ons het regtig gepraat. Hy het van sy eie skoolfoute vertel, en ek het besef hy was ook eendag net 'n kind. Ek gaan hierdie dag lank onthou. Miskien is dit die begin van iets nuuts.",
        commonErrors: [
          "'n Formele register gebruik — 'n dagboek is persoonlik en informeel.",
          "Gebeure lys sonder te reflekteer.",
          "Datum en aanspreekvorm weglaat."
        ]
      },
      {
        question: "Skryf 'n advertensie in Afrikaans vir 'n skoolfondsinsameling.",
        steps: [
          "Pakkende opskrif wat die geleentheid benoem.",
          "Sleutelbesonderhede: datum, tyd, plek, prys, kontak.",
          "Oorredings taal: voordele, spesiale kenmerke, aksie-oproepe.",
          "Hou dit kort en visueel in uitleg."
        ],
        solution: "🎂 GROOT KOEKVERKOPING — KOELENHOF HOËR 🎂 // Wanneer: Vrydag, 6 Junie 2026 | Plek: Skoolsaal | Tyd: 12:00–14:00 // Tuisgemaakte lekkernye teen onklopbare pryse! Alle opbrengste na ons nuwe biblioteek. Kontak: skoolfonds@koelenhof.ac.za // BRING JOU FAMILIE — BRING JOU APTYT!",
        commonErrors: [
          "Sleutelbesonderhede weglaat.",
          "'n Formele register gebruik.",
          "Geen aksie-oproepe insluit."
        ]
      }
    ]
  },

  // ===================== MATHEMATICAL LITERACY (MATL) =====================

  "MATL-1": {
    workedExamplesEn: [
      {
        question: "A clothing store is selling a jacket for R850 (original price). It is marked '15% off'. Calculate the sale price and the VAT-inclusive sale price (VAT = 15%).",
        steps: [
          "Calculate the discount amount: 15% × R850 = 0.15 × 850 = R127.50.",
          "Calculate the sale price: R850 − R127.50 = R722.50.",
          "Calculate VAT on the sale price: 15% × R722.50 = 0.15 × 722.50 = R108.375 ≈ R108.38.",
          "VAT-inclusive price: R722.50 + R108.38 = R830.88."
        ],
        solution: "Sale price (before VAT) = R722.50. VAT-inclusive sale price = R830.88.",
        commonErrors: [
          "Calculating 15% discount on the original price AND then adding VAT on the original price — VAT is on the discounted price.",
          "Forgetting to round VAT to 2 decimal places (cents).",
          "Subtracting 15% discount and 15% VAT from the original, treating them as the same 15%."
        ]
      },
      {
        question: "Mpho earns R18 500/month. She pays 25% income tax and 1% UIF. Calculate her take-home pay.",
        steps: [
          "Calculate income tax: 25% × R18 500 = 0.25 × 18 500 = R4 625.",
          "Calculate UIF: 1% × R18 500 = 0.01 × 18 500 = R185.",
          "Total deductions: R4 625 + R185 = R4 810.",
          "Take-home pay: R18 500 − R4 810 = R13 690."
        ],
        solution: "Take-home pay = R13 690.",
        commonErrors: [
          "Applying UIF to take-home pay rather than gross salary.",
          "Adding tax and UIF before subtracting, then subtracting only once — this is correct, but students often subtract each separately and make arithmetic errors.",
          "Confusing gross pay (before deductions) with net pay (take-home pay)."
        ]
      },
      {
        question: "A loan of R10 000 is taken at 12% simple interest per annum for 3 years. Calculate the total amount repayable.",
        steps: [
          "Write the simple interest formula: A = P(1 + i·n).",
          "Identify: P = 10 000, i = 0.12, n = 3.",
          "Substitute: A = 10 000 × (1 + 0.12 × 3) = 10 000 × (1 + 0.36) = 10 000 × 1.36.",
          "Calculate: A = R13 600."
        ],
        solution: "Total repayable = R13 600. Interest paid = R13 600 − R10 000 = R3 600.",
        commonErrors: [
          "Using compound interest formula A = P(1 + i)^n instead of simple interest A = P(1 + i·n).",
          "Using i = 12 instead of i = 0.12 (must convert percentage to decimal).",
          "Forgetting to calculate the total repayable and only giving the interest amount."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Mpho verdien R18 500/maand. Sy betaal 25% inkomstebelasting en 1% WVF. Bereken haar netto salaris.",
        steps: [
          "Bereken inkomstebelasting: 25% × R18 500 = R4 625.",
          "Bereken WVF: 1% × R18 500 = R185.",
          "Totale aftrekkings: R4 625 + R185 = R4 810.",
          "Netto salaris: R18 500 − R4 810 = R13 690."
        ],
        solution: "Netto salaris = R13 690.",
        commonErrors: [
          "WVF op die netto salaris bereken in plaas van bruto salaris.",
          "Belasting en WVF apart aftrek en rekenkundige foute maak.",
          "Bruto salaris (voor aftrekkings) en netto salaris (tuisneembesoldiging) verwar."
        ]
      },
      {
        question: "Kledingwinkel verkoop 'n baadjie vir R850. Dit is '15% af'. Bereken die afslag prys en die BTW-inklusiewe prys (BTW = 15%).",
        steps: [
          "Bereken die afslag bedrag: 15% × R850 = R127.50.",
          "Bereken die afslag prys: R850 − R127.50 = R722.50.",
          "Bereken BTW op die afslag prys: 15% × R722.50 = R108.38.",
          "BTW-inklusiewe prys: R722.50 + R108.38 = R830.88."
        ],
        solution: "Afslag prys (voor BTW) = R722.50. BTW-inklusiewe prys = R830.88.",
        commonErrors: [
          "BTW op die oorspronklike prys bereken in plaas van die afslag prys.",
          "Vergeet om BTW tot 2 desimale syfers af te rond.",
          "15% afslag en 15% BTW as dieselfde 15% behandel."
        ]
      },
      {
        question: "Lening van R10 000 teen 12% eenvoudige rente per jaar vir 3 jaar. Bereken die totale terugbetaalbare bedrag.",
        steps: [
          "Skryf die formule: A = P(1 + i·n).",
          "Identifiseer: P = 10 000, i = 0.12, n = 3.",
          "Vervang: A = 10 000 × (1 + 0.12 × 3) = 10 000 × 1.36.",
          "Bereken: A = R13 600."
        ],
        solution: "Totale terugbetaalbaar = R13 600. Rente betaal = R3 600.",
        commonErrors: [
          "Saamgestelde rente-formule gebruik in plaas van eenvoudige rente.",
          "i = 12 gebruik in plaas van i = 0.12.",
          "Vergeet om die totale terugbetaalbare bedrag te bereken."
        ]
      }
    ]
  },

  "MATL-2": {
    workedExamplesEn: [
      {
        question: "The following data set represents test scores: 45, 52, 67, 52, 88, 91, 52, 73, 45, 88. Find the mean, median, and mode.",
        steps: [
          "Sort the data: 45, 45, 52, 52, 52, 67, 73, 88, 88, 91.",
          "Mean: sum all values = 653; divide by 10 → mean = 65.3.",
          "Median: 10 values — average of 5th and 6th: (52 + 67)/2 = 119/2 = 59.5.",
          "Mode: 52 appears 3 times (most frequent) → mode = 52."
        ],
        solution: "Mean = 65.3; Median = 59.5; Mode = 52.",
        commonErrors: [
          "Not sorting the data before finding the median — always sort first.",
          "For an even data set, finding median as the middle number rather than the average of the two middle numbers.",
          "Confusing mean and median: mean is the average; median is the middle value."
        ]
      },
      {
        question: "Construct a box-and-whisker plot for: 12, 15, 18, 20, 22, 25, 28, 30, 35.",
        steps: [
          "Data is already sorted. Identify: Min = 12, Max = 35.",
          "Median (Q2): 9 values → 5th value = 22.",
          "Lower quartile (Q1): median of lower half (12, 15, 18, 20) = (15 + 18)/2 = 16.5.",
          "Upper quartile (Q3): median of upper half (25, 28, 30, 35) = (28 + 30)/2 = 29.",
          "Draw number line; mark Min, Q1, Q2, Q3, Max; draw box from Q1 to Q3 with line at Q2; draw whiskers to Min and Max."
        ],
        solution: "Min = 12, Q1 = 16.5, Q2 = 22, Q3 = 29, Max = 35. IQR = Q3 − Q1 = 29 − 16.5 = 12.5.",
        commonErrors: [
          "Including the median in both halves when finding Q1 and Q3 for an odd-numbered data set.",
          "Confusing IQR (Q3 − Q1) with range (Max − Min).",
          "Drawing the whiskers to Q1 and Q3 rather than to Min and Max."
        ]
      },
      {
        question: "A pie chart shows: Sport 40%, Music 25%, Drama 20%, Other 15%. If 200 learners were surveyed, how many chose Drama?",
        steps: [
          "Identify the percentage for Drama: 20%.",
          "Convert percentage to fraction: 20% = 20/100 = 0.20.",
          "Multiply by total: 0.20 × 200 = 40.",
          "Check: all percentages sum to 100%: 40 + 25 + 20 + 15 = 100% ✓."
        ],
        solution: "40 learners chose Drama.",
        commonErrors: [
          "Using 20 directly as the number of learners rather than calculating 20% of 200.",
          "Not checking that all percentages sum to 100%.",
          "Dividing 200 by 20 rather than multiplying 200 by 0.20."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Datastel: 45, 52, 67, 52, 88, 91, 52, 73, 45, 88. Vind die gemiddelde, mediaan en modus.",
        steps: [
          "Sorteer: 45, 45, 52, 52, 52, 67, 73, 88, 88, 91.",
          "Gemiddelde: som = 653; gedeel deur 10 → 65.3.",
          "Mediaan: 10 waardes — gemiddeld van 5de en 6de: (52 + 67)/2 = 59.5.",
          "Modus: 52 verskyn 3 keer → modus = 52."
        ],
        solution: "Gemiddelde = 65.3; Mediaan = 59.5; Modus = 52.",
        commonErrors: [
          "Nie sorteer voor die mediaan vind nie.",
          "Vir 'n ewe datastel, die middelnommer gebruik in plaas van die gemiddeld van die twee middelste.",
          "Gemiddelde en mediaan verwar."
        ]
      },
      {
        question: "Bou 'n boks-en-snor diagram vir: 12, 15, 18, 20, 22, 25, 28, 30, 35.",
        steps: [
          "Min = 12, Maks = 35.",
          "Mediaan (K2): 9 waardes → 5de waarde = 22.",
          "Onderste kwartiel (K1): mediaan van (12, 15, 18, 20) = 16.5.",
          "Boste kwartiel (K3): mediaan van (25, 28, 30, 35) = 29.",
          "Teken getallelyn; merk Min, K1, K2, K3, Maks."
        ],
        solution: "Min = 12, K1 = 16.5, K2 = 22, K3 = 29, Maks = 35. ITB = 12.5.",
        commonErrors: [
          "Die mediaan in beide helftes insluit vir 'n onewe datastel.",
          "ITB (K3 − K1) met die omvang (Maks − Min) verwar.",
          "Snoers na K1 en K3 eerder as Min en Maks teken."
        ]
      },
      {
        question: "Sirkelgrafiek: Sport 40%, Musiek 25%, Drama 20%, Ander 15%. As 200 leerders ondervra is, hoeveel het Drama gekies?",
        steps: [
          "Drama = 20%.",
          "Omskakel na breuk: 20% = 0.20.",
          "Vermenigvuldig: 0.20 × 200 = 40.",
          "Kontroleer: alle persentasies som tot 100%."
        ],
        solution: "40 leerders het Drama gekies.",
        commonErrors: [
          "20 direk as die getal leerders gebruik eerder as 20% van 200 bereken.",
          "Nie kontroleer dat alle persentasies tot 100% optel nie.",
          "200 deur 20 deel eerder as 200 met 0.20 vermenigvuldig."
        ]
      }
    ]
  },

  "MATL-3": {
    workedExamplesEn: [
      {
        question: "A circular swimming pool has a diameter of 8 m. Calculate the area and the circumference.",
        steps: [
          "Find radius: r = diameter/2 = 8/2 = 4 m.",
          "Area: A = π·r² = π × 4² = π × 16 ≈ 50.27 m².",
          "Circumference: C = 2π·r = 2 × π × 4 ≈ 25.13 m."
        ],
        solution: "Area ≈ 50.27 m²; Circumference ≈ 25.13 m.",
        commonErrors: [
          "Using diameter instead of radius in the formulas.",
          "Forgetting to square the radius: using πr instead of πr².",
          "Confusing area (m²) and circumference (m) — area is two-dimensional, circumference is one-dimensional."
        ]
      },
      {
        question: "A cylindrical tank has a radius of 1.5 m and a height of 2 m. Calculate the volume in litres (1 m³ = 1000 litres).",
        steps: [
          "Volume of cylinder: V = π·r²·h.",
          "Substitute: V = π × (1.5)² × 2 = π × 2.25 × 2 = π × 4.5 ≈ 14.14 m³.",
          "Convert to litres: 14.14 m³ × 1000 = 14 140 litres."
        ],
        solution: "Volume ≈ 14 140 litres.",
        commonErrors: [
          "Forgetting to square the radius (using r = 1.5 instead of r² = 2.25).",
          "Multiplying by the diameter instead of the radius.",
          "Not converting m³ to litres when the question asks for litres."
        ]
      },
      {
        question: "Convert 36°C to Fahrenheit and 98.6°F to Celsius.",
        steps: [
          "°C to °F: F = C × 9/5 + 32 = 36 × 9/5 + 32 = 64.8 + 32 = 96.8°F.",
          "°F to °C: C = (F − 32) × 5/9 = (98.6 − 32) × 5/9 = 66.6 × 5/9 = 333/9 ≈ 37°C."
        ],
        solution: "36°C = 96.8°F; 98.6°F = 37°C (normal body temperature).",
        commonErrors: [
          "For °C to °F: subtracting 32 first instead of multiplying by 9/5 first.",
          "For °F to °C: forgetting to subtract 32 before multiplying by 5/9.",
          "Rounding too early in multi-step calculations — carry full decimals until the final answer."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Sirkelvormige swembad met 'n deursnee van 8 m. Bereken die oppervlak en omtrek.",
        steps: [
          "Straal: r = 8/2 = 4 m.",
          "Oppervlak: A = π·r² = π × 16 ≈ 50.27 m².",
          "Omtrek: C = 2π·r = 2 × π × 4 ≈ 25.13 m."
        ],
        solution: "Oppervlak ≈ 50.27 m²; Omtrek ≈ 25.13 m.",
        commonErrors: [
          "Deursnee in plaas van straal in die formules gebruik.",
          "Vergeet om die straal te kwadrateer.",
          "Oppervlak (m²) en omtrek (m) verwar."
        ]
      },
      {
        question: "Silindriese tenk met straal 1.5 m en hoogte 2 m. Bereken die volume in liter (1 m³ = 1000 liter).",
        steps: [
          "Volume: V = π·r²·h.",
          "Vervang: V = π × (1.5)² × 2 ≈ 14.14 m³.",
          "Omskakel: 14.14 × 1000 = 14 140 liter."
        ],
        solution: "Volume ≈ 14 140 liter.",
        commonErrors: [
          "Vergeet om die straal te kwadrateer.",
          "Die deursnee in plaas van die straal gebruik.",
          "Nie omskakel na liter wanneer die vraag liter vereis nie."
        ]
      },
      {
        question: "Omskakel 36°C na Fahrenheit en 98.6°F na Celsius.",
        steps: [
          "°C na °F: F = C × 9/5 + 32 = 36 × 1.8 + 32 = 64.8 + 32 = 96.8°F.",
          "°F na °C: C = (F − 32) × 5/9 = (98.6 − 32) × 5/9 = 66.6 × 5/9 ≈ 37°C."
        ],
        solution: "36°C = 96.8°F; 98.6°F = 37°C.",
        commonErrors: [
          "Vir °C na °F: 32 eerste aftrek in plaas van vermenigvuldig met 9/5.",
          "Vir °F na °C: vergeet om 32 af te trek voor vermenigvuldig met 5/9.",
          "Te vroeg afrond — dra volle desimale tot die finale antwoord."
        ]
      }
    ]
  },

  "MATL-4": {
    workedExamplesEn: [
      {
        question: "A floor plan is drawn at 1:50 scale. A room measures 6 cm × 4 cm on the plan. What are the actual dimensions?",
        steps: [
          "Scale 1:50 means 1 cm on plan = 50 cm in reality.",
          "Actual length: 6 cm × 50 = 300 cm = 3 m.",
          "Actual width: 4 cm × 50 = 200 cm = 2 m."
        ],
        solution: "Actual room: 3 m × 2 m.",
        commonErrors: [
          "Dividing by the scale factor instead of multiplying.",
          "Forgetting to convert cm to m in the final answer.",
          "Applying the scale factor to one dimension only."
        ]
      },
      {
        question: "A map has a scale of 1:250 000. Two cities are 12 cm apart on the map. What is the actual distance in km?",
        steps: [
          "Actual distance in cm: 12 × 250 000 = 3 000 000 cm.",
          "Convert to km: 3 000 000 cm ÷ 100 = 30 000 m ÷ 1 000 = 30 km."
        ],
        solution: "Actual distance = 30 km.",
        commonErrors: [
          "Confusing the conversion chain: 100 cm = 1 m and 1 000 m = 1 km.",
          "Dividing by the scale instead of multiplying.",
          "Not converting cm to km — leaving the answer in cm."
        ]
      },
      {
        question: "A town is due North of a river crossing. You are standing at the crossing facing the town. Give the compass bearing to return south and explain what NE means.",
        steps: [
          "Identify: North = 0° / 360°; South = 180°; East = 90°; West = 270°.",
          "Returning south: turn 180° from North → bearing = 180°.",
          "NE (Northeast) is exactly between North (0°) and East (90°) → NE = 045°."
        ],
        solution: "To return south: bearing 180°. NE = 045° (halfway between North and East).",
        commonErrors: [
          "Saying 'turn 90°' to go south — you need a 180° turn from north.",
          "Placing NE at 135° (SE position) rather than 045°.",
          "Confusing true bearing (measured clockwise from North) with compass point names."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Vloerplan is geteken op 1:50 skaal. 'n Kamer meet 6 cm × 4 cm op die plan. Wat is die werklike afmetings?",
        steps: [
          "Skaal 1:50: 1 cm op plan = 50 cm in werklikheid.",
          "Werklike lengte: 6 × 50 = 300 cm = 3 m.",
          "Werklike breedte: 4 × 50 = 200 cm = 2 m."
        ],
        solution: "Werklike kamer: 3 m × 2 m.",
        commonErrors: [
          "Deur die skaalfaktor deel in plaas van vermenigvuldig.",
          "Vergeet om cm na m te omskakel.",
          "Slegs een dimensie skaleer."
        ]
      },
      {
        question: "Kaart het skaal 1:250 000. Twee stede is 12 cm uitmekaar op die kaart. Werklike afstand in km?",
        steps: [
          "Werklike afstand: 12 × 250 000 = 3 000 000 cm.",
          "Omskakel: 3 000 000 ÷ 100 = 30 000 m ÷ 1 000 = 30 km."
        ],
        solution: "Werklike afstand = 30 km.",
        commonErrors: [
          "Die omskakelketting vergeet: 100 cm = 1 m en 1 000 m = 1 km.",
          "Deur die skaal deel in plaas van vermenigvuldig.",
          "Nie na km omskakel nie."
        ]
      },
      {
        question: "'n Dorp is direk Noord van 'n rivieroorgang. Jy staan by die oorgang en kyk na die dorp. Gee die kompaspeiling om terug suid te gaan en verduidelik wat NO beteken.",
        steps: [
          "Noord = 0°/360°; Suid = 180°; Oos = 90°; Wes = 270°.",
          "Terugkeer suid: draai 180° van Noord → peiling = 180°.",
          "NO (Noordoos) is halverwee tussen Noord (0°) en Oos (90°) → NO = 045°."
        ],
        solution: "Terugkeer suid: peiling 180°. NO = 045°.",
        commonErrors: [
          "'Draai 90°' sê om suid toe te gaan — 'n 180°-draai van noord word benodig.",
          "NO by 135° (SO-posisie) plaas eerder as 045°.",
          "Ware peiling (met die uurwyser vanaf Noord gemeet) met kompaspuntnaam verwar."
        ]
      }
    ]
  },

  "MATL-5": {
    workedExamplesEn: [
      {
        question: "A bag contains 4 red balls, 3 blue balls, and 3 green balls. What is the probability of picking a blue ball?",
        steps: [
          "Total balls: 4 + 3 + 3 = 10.",
          "Favourable outcomes (blue): 3.",
          "P(blue) = favourable/total = 3/10.",
          "Express as decimal: 0.3 or percentage: 30%."
        ],
        solution: "P(blue) = 3/10 = 0.3 = 30%.",
        commonErrors: [
          "Using 3 out of 7 (forgetting to include all colour totals in the denominator).",
          "Forgetting to count all ball types when calculating total.",
          "Giving P > 1 — probability is always between 0 and 1 inclusive."
        ]
      },
      {
        question: "Two coins are tossed. Using a tree diagram, list all outcomes and find P(at least one head).",
        steps: [
          "Draw tree: Coin 1 (H/T) → Coin 2 (H/T each branch) → Outcomes: HH, HT, TH, TT.",
          "Total outcomes: 4.",
          "Outcomes with at least one head: HH, HT, TH → 3 outcomes.",
          "P(at least one head) = 3/4."
        ],
        solution: "P(at least one head) = 3/4 = 0.75 = 75%.",
        commonErrors: [
          "Only listing 3 outcomes (forgetting TT counts as a possibility).",
          "Confusing 'at least one head' with 'exactly one head' — at least one means HH, HT, TH (not just HT and TH).",
          "Not using a tree diagram when the question specifies it — show method systematically."
        ]
      },
      {
        question: "A weather forecast states a 70% chance of rain tomorrow. A gardener uses this to decide whether to water the garden. Explain theoretical vs experimental probability in this context.",
        steps: [
          "Theoretical probability: based on mathematical model/historical data — 70% derived from weather patterns over many years.",
          "Experimental probability: what actually happens on a specific day — could be rain (event A occurs) or no rain (event A does not occur).",
          "The forecast cannot guarantee the outcome — probability describes likelihood, not certainty.",
          "Decision-making: with 70% chance of rain, the gardener should probably not water (70% > 50% threshold)."
        ],
        solution: "Theoretical P(rain) = 0.70 based on historical data. Experimental outcome tomorrow is binary: it either rains or it doesn't — the 70% reflects the model's prediction, not a guarantee.",
        commonErrors: [
          "Treating probability as a guarantee: '70% means it will probably rain' — probability is likelihood, not certainty.",
          "Confusing theoretical (model-based) with experimental (actual observation).",
          "Misapplying 70% as '7 out of 10 days this week will have rain' — probabilities apply to repeated events, not predetermined weekly schedules."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Sak bevat 4 rooi balle, 3 blou balle en 3 groen balle. Waarskynlikheid om 'n blou bal te kies?",
        steps: [
          "Totale balle: 4 + 3 + 3 = 10.",
          "Gunstige uitkomste (blou): 3.",
          "W(blou) = 3/10.",
          "As desimaal: 0.3 of persentasie: 30%."
        ],
        solution: "W(blou) = 3/10 = 0.3 = 30%.",
        commonErrors: [
          "3 uit 7 gebruik (vergeet om alle kleure in die noemer in te sluit).",
          "Nie alle baltipes tel nie.",
          "W > 1 gee — waarskynlikheid is altyd tussen 0 en 1."
        ]
      },
      {
        question: "Twee munte word gegooi. Gebruik 'n boomdiagram om alle uitkomste te lys en W(ten minste een kruis) te vind.",
        steps: [
          "Teken boom: Munt 1 (K/S) → Munt 2 (K/S elke tak) → Uitkomste: KK, KS, SK, SS.",
          "Totale uitkomste: 4.",
          "Uitkomste met ten minste een kruis: KK, KS, SK → 3.",
          "W(ten minste een kruis) = 3/4."
        ],
        solution: "W(ten minste een kruis) = 3/4 = 75%.",
        commonErrors: [
          "Slegs 3 uitkomste lys (SS as moontlikheid vergeet).",
          "'Ten minste een kruis' met 'presies een kruis' verwar.",
          "Nie boomdiagram gebruik wanneer die vraag dit spesifiseer nie."
        ]
      },
      {
        question: "Weervoorspelling: 70% kans op reën môre. Verduidelik teoretiese vs eksperimentele waarskynlikheid in konteks.",
        steps: [
          "Teoretiese waarskynlikheid: gebaseer op wiskundige model/historiese data — 70% afgelei uit weerpatrone.",
          "Eksperimentele waarskynlikheid: wat werklik gebeur op 'n spesifieke dag.",
          "Die voorspelling kan nie die uitkoms waarborg nie.",
          "Besluit: met 70% kans op reën, behoort die tuinier waarskynlik nie nat te maak nie."
        ],
        solution: "Teoretiese W(reën) = 0.70 gebaseer op historiese data. Eksperimentele uitkoms môre is binêr: dit reën óf dit reën nie.",
        commonErrors: [
          "Waarskynlikheid as 'n waarborg behandel.",
          "Teoretiese en eksperimentele verwar.",
          "70% verkeerd toepas as '7 uit 10 dae hierdie week sal reën'."
        ]
      }
    ]
  },

  // ===================== ACCOUNTING (ACC) =====================

  "ACC-1": {
    workedExamplesEn: [
      {
        question: "Prepare an Income Statement extract: Revenue = R500 000; Cost of Sales = R300 000; Selling Expenses = R40 000; Admin Expenses = R30 000.",
        steps: [
          "Gross Profit = Revenue − Cost of Sales = R500 000 − R300 000 = R200 000.",
          "Total Operating Expenses = Selling + Admin = R40 000 + R30 000 = R70 000.",
          "Operating Profit = Gross Profit − Operating Expenses = R200 000 − R70 000 = R130 000."
        ],
        solution: "Gross Profit = R200 000; Operating Profit = R130 000.",
        commonErrors: [
          "Subtracting all expenses from revenue at once without calculating Gross Profit first.",
          "Including Cost of Sales in Operating Expenses — it belongs above the Gross Profit line.",
          "Confusing Gross Profit (before operating expenses) with Net Profit (after all expenses including tax)."
        ]
      },
      {
        question: "A company's Balance Sheet shows: Non-current Assets R800 000; Current Assets R200 000; Non-current Liabilities R300 000; Current Liabilities R100 000. Calculate total equity.",
        steps: [
          "Total Assets = Non-current Assets + Current Assets = R800 000 + R200 000 = R1 000 000.",
          "Total Liabilities = Non-current + Current = R300 000 + R100 000 = R400 000.",
          "Equity = Total Assets − Total Liabilities = R1 000 000 − R400 000 = R600 000.",
          "Verify: Assets = Equity + Liabilities → R1 000 000 = R600 000 + R400 000 ✓."
        ],
        solution: "Equity = R600 000.",
        commonErrors: [
          "Adding all items together instead of using the accounting equation.",
          "Confusing the accounting equation direction: Assets = Equity + Liabilities (not Equity = Assets + Liabilities).",
          "Not verifying the equation balances — always check that A = E + L."
        ]
      },
      {
        question: "Classify the following cash flows: (a) received from customers, (b) machinery purchase, (c) loan repaid, (d) salaries paid.",
        steps: [
          "(a) Received from customers → Operating activity (core business).",
          "(b) Machinery purchase → Investing activity (acquiring long-term assets).",
          "(c) Loan repaid → Financing activity (debt management).",
          "(d) Salaries paid → Operating activity (day-to-day business costs)."
        ],
        solution: "(a) Operating; (b) Investing; (c) Financing; (d) Operating.",
        commonErrors: [
          "Classifying loan repayment as operating — financing activities involve debt and equity, not core operations.",
          "Classifying machinery purchase as operating — machinery is a long-term investment.",
          "Confusing 'investing' in financial securities (investing activity) with investing in equipment (also investing activity, but often mixed up with financing)."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Berei 'n Inkomstestaat-uittreksel voor: Inkomste = R500 000; Koste van Verkope = R300 000; Verkoopsuitgawes = R40 000; Administrasieuitgawes = R30 000.",
        steps: [
          "Bruto Wins = Inkomste − Koste van Verkope = R500 000 − R300 000 = R200 000.",
          "Totale Bedryfsuitgawes = R40 000 + R30 000 = R70 000.",
          "Bedryfswin = R200 000 − R70 000 = R130 000."
        ],
        solution: "Bruto Wins = R200 000; Bedryfswin = R130 000.",
        commonErrors: [
          "Alle uitgawes van inkomste aftrek sonder Bruto Wins eerste te bereken.",
          "Koste van Verkope in Bedryfsuitgawes insluit.",
          "Bruto Wins (voor bedryfsuitgawes) met Netto Wins (na alle uitgawes) verwar."
        ]
      },
      {
        question: "Balansstaat: Nie-bedryfsbates R800 000; Bedryfsbates R200 000; Nie-bedryfslaste R300 000; Bedryfslaste R100 000. Bereken totale ekwiteit.",
        steps: [
          "Totale Bates = R800 000 + R200 000 = R1 000 000.",
          "Totale Laste = R300 000 + R100 000 = R400 000.",
          "Ekwiteit = R1 000 000 − R400 000 = R600 000.",
          "Verifieer: Bates = Ekwiteit + Laste → R1 000 000 = R600 000 + R400 000 ✓."
        ],
        solution: "Ekwiteit = R600 000.",
        commonErrors: [
          "Alle items bymekaar tel in plaas van die rekeningkunde-vergelyking gebruik.",
          "Vergelyking rigting verwar: Bates = Ekwiteit + Laste.",
          "Nie verifieer dat die vergelyking balanseer nie."
        ]
      },
      {
        question: "Klassifiseer kontantvloei: (a) ontvang van kliënte, (b) masjienerie aankoop, (c) lening terugbetaal, (d) salarisse betaal.",
        steps: [
          "(a) Van kliënte ontvang → Bedryfsaktiwiteit.",
          "(b) Masjienerie aankoop → Beleggingsaktiwiteit.",
          "(c) Lening terugbetaal → Finansieringsaktiwiteit.",
          "(d) Salarisse betaal → Bedryfsaktiwiteit."
        ],
        solution: "(a) Bedryfend; (b) Belê; (c) Finansiering; (d) Bedryfend.",
        commonErrors: [
          "Leningsterugbetaling as bedryfend klassifiseer.",
          "Masjienerie-aankoop as bedryfend klassifiseer.",
          "Belegging in finansiële sekuriteite met belegging in toerusting verwar."
        ]
      }
    ]
  },

  "ACC-2": {
    workedExamplesEn: [
      {
        question: "Calculate the current ratio and acid test ratio: Current Assets = R180 000 (including inventory R60 000); Current Liabilities = R90 000.",
        steps: [
          "Current Ratio = Current Assets / Current Liabilities = R180 000 / R90 000 = 2:1.",
          "Acid Test Ratio = (Current Assets − Inventory) / Current Liabilities = (R180 000 − R60 000) / R90 000 = R120 000 / R90 000 = 1.33:1.",
          "Interpretation: Current ratio 2:1 is healthy (standard ≥ 1.5:1). Acid test 1.33:1 is also healthy (standard ≥ 1:1)."
        ],
        solution: "Current ratio = 2:1 (healthy); Acid test = 1.33:1 (healthy).",
        commonErrors: [
          "Using Total Assets instead of Current Assets in the numerator.",
          "Forgetting to subtract inventory for the acid test ratio.",
          "Not expressing ratios as X:1 — always compare to 1."
        ]
      },
      {
        question: "Calculate and interpret the debt-to-equity ratio: Total Debt = R400 000; Total Equity = R600 000.",
        steps: [
          "Debt:Equity ratio = Total Debt / Total Equity = R400 000 / R600 000 = 0.67:1.",
          "Interpret: for every R1 of equity, the company owes R0.67 of debt — i.e. mostly equity-financed.",
          "Benchmark: ratio < 1:1 means equity > debt (lower financial risk). > 2:1 indicates high gearing (risk)."
        ],
        solution: "Debt:Equity = 0.67:1 — the business is relatively low-geared, with more equity than debt.",
        commonErrors: [
          "Inverting the ratio: Equity / Debt instead of Debt / Equity.",
          "Confusing gearing with leverage — both describe reliance on debt, but gearing specifically compares debt to equity.",
          "Not interpreting the ratio in context — stating the number without explaining what it means for the business."
        ]
      },
      {
        question: "Calculate the return on equity (ROE): Net Profit = R120 000; Total Equity = R600 000.",
        steps: [
          "ROE = Net Profit / Total Equity × 100.",
          "ROE = R120 000 / R600 000 × 100 = 0.20 × 100 = 20%.",
          "Interpret: the company earns R0.20 (20c) for every R1 invested by shareholders."
        ],
        solution: "ROE = 20% — satisfactory if higher than the prevailing bank interest rate.",
        commonErrors: [
          "Using Gross Profit instead of Net Profit in the numerator.",
          "Forgetting to multiply by 100 to express as a percentage.",
          "Not comparing ROE to a benchmark — an isolated ratio has limited meaning."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Bereken die bedryfsverhouding en suurtoets: Bedryfsbates = R180 000 (insluitend voorraad R60 000); Bedryfslaste = R90 000.",
        steps: [
          "Bedryfsverhouding = R180 000 / R90 000 = 2:1.",
          "Suurtoets = (R180 000 − R60 000) / R90 000 = R120 000 / R90 000 = 1.33:1.",
          "Interpretasie: 2:1 is gesond; 1.33:1 is ook gesond."
        ],
        solution: "Bedryfsverhouding = 2:1; Suurtoets = 1.33:1.",
        commonErrors: [
          "Totale Bates in plaas van Bedryfsbates gebruik.",
          "Vergeet om voorraad vir die suurtoets af te trek.",
          "Verhoudings nie as X:1 uitdruk nie."
        ]
      },
      {
        question: "Bereken en interpreteer die skuld:ekwiteit-verhouding: Totale Skuld = R400 000; Totale Ekwiteit = R600 000.",
        steps: [
          "Skuld:Ekwiteit = R400 000 / R600 000 = 0.67:1.",
          "Interpreteer: vir elke R1 ekwiteit skuld die maatskappy R0.67 — hoofsaaklik ekwiteit-gefinansierd.",
          "Verwysing: < 1:1 beteken ekwiteit > skuld (laer finansiële risiko)."
        ],
        solution: "Skuld:Ekwiteit = 0.67:1 — relatief lae hefboomwerking.",
        commonErrors: [
          "Verhouding omgekeer: Ekwiteit / Skuld in plaas van Skuld / Ekwiteit.",
          "Hefboomwerking en finansiering verwar.",
          "Die verhouding nie in konteks interpreteer nie."
        ]
      },
      {
        question: "Bereken die opbrengs op ekwiteit (ROE): Netto Wins = R120 000; Totale Ekwiteit = R600 000.",
        steps: [
          "ROE = Netto Wins / Totale Ekwiteit × 100.",
          "ROE = R120 000 / R600 000 × 100 = 20%.",
          "Interpreteer: die maatskappy verdien 20c vir elke R1 deur aandeelhouers belê."
        ],
        solution: "ROE = 20%.",
        commonErrors: [
          "Bruto Wins in plaas van Netto Wins gebruik.",
          "Vergeet om met 100 te vermenigvuldig.",
          "ROE nie met 'n maatstaf vergelyk nie."
        ]
      }
    ]
  },

  "ACC-3": {
    workedExamplesEn: [
      {
        question: "Calculate the cost of production: Direct Materials = R120 000; Direct Labour = R80 000; Factory Overheads = R50 000; Work-in-progress opening = R20 000; closing = R15 000.",
        steps: [
          "Prime Cost = Direct Materials + Direct Labour = R120 000 + R80 000 = R200 000.",
          "Total Manufacturing Cost = Prime Cost + Factory Overheads = R200 000 + R50 000 = R250 000.",
          "Cost of Production = Opening WIP + Total Manufacturing Cost − Closing WIP = R20 000 + R250 000 − R15 000 = R255 000."
        ],
        solution: "Cost of Production = R255 000.",
        commonErrors: [
          "Forgetting to add opening WIP and subtract closing WIP — these adjust for partially finished goods.",
          "Including selling or admin expenses in factory overheads.",
          "Confusing prime cost (direct only) with total manufacturing cost (prime + overheads)."
        ]
      },
      {
        question: "A factory produces 5 000 units. Fixed costs = R100 000; Variable costs = R20/unit. Calculate total cost and cost per unit.",
        steps: [
          "Total Variable Costs = 5 000 × R20 = R100 000.",
          "Total Cost = Fixed + Variable = R100 000 + R100 000 = R200 000.",
          "Cost per unit = Total Cost / Units = R200 000 / 5 000 = R40/unit."
        ],
        solution: "Total cost = R200 000; Cost per unit = R40.",
        commonErrors: [
          "Treating fixed costs as per-unit (fixed costs do not change with output).",
          "Calculating cost per unit using only variable costs — total cost must include fixed.",
          "Not dividing total cost by total units to get unit cost."
        ]
      },
      {
        question: "Classify these costs as direct material, direct labour, or factory overhead: (a) steel used in car production, (b) factory manager's salary, (c) wages of assembly line workers, (d) factory electricity.",
        steps: [
          "(a) Steel — Direct Material (physically forms the product).",
          "(b) Factory manager — Factory Overhead (indirect; cannot be traced to specific units).",
          "(c) Assembly workers — Direct Labour (directly produce the goods).",
          "(d) Factory electricity — Factory Overhead (indirect manufacturing cost)."
        ],
        solution: "(a) Direct Material; (b) Factory Overhead; (c) Direct Labour; (d) Factory Overhead.",
        commonErrors: [
          "Classifying factory manager's salary as direct labour — only workers who physically make the product qualify.",
          "Treating factory electricity as an admin expense — it is a manufacturing overhead.",
          "Confusing direct and indirect by focusing on where costs occur rather than their traceability to the product."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Bereken die produksiekoste: Direkte Materiaal = R120 000; Direkte Arbeid = R80 000; Fabrieksbokoste = R50 000; OIS opening = R20 000; afsluiting = R15 000.",
        steps: [
          "Hoofkoste = R120 000 + R80 000 = R200 000.",
          "Totale Vervaardigingskoste = R200 000 + R50 000 = R250 000.",
          "Produksiekoste = R20 000 + R250 000 − R15 000 = R255 000."
        ],
        solution: "Produksiekoste = R255 000.",
        commonErrors: [
          "Vergeet om OIS te by te tel en af te trek.",
          "Verkoops- of administrasieuitgawes in fabrieksbokoste insluit.",
          "Hoofkoste (slegs direk) met totale vervaardigingskoste (hoofkoste + bokoste) verwar."
        ]
      },
      {
        question: "Fabriek vervaardig 5 000 eenhede. Vaste koste = R100 000; Veranderlike koste = R20/eenheid. Bereken totale koste en koste per eenheid.",
        steps: [
          "Totale Veranderlike Koste = 5 000 × R20 = R100 000.",
          "Totale Koste = R100 000 + R100 000 = R200 000.",
          "Koste per eenheid = R200 000 / 5 000 = R40."
        ],
        solution: "Totale koste = R200 000; Koste per eenheid = R40.",
        commonErrors: [
          "Vaste koste as per-eenheid behandel.",
          "Koste per eenheid met slegs veranderlike koste bereken.",
          "Nie totale koste deur totale eenhede deel nie."
        ]
      },
      {
        question: "Klassifiseer: (a) staal in motorvervaardiging, (b) fabriekbestuurder se salaris, (c) lone van samestelling-werkers, (d) fabriekselektrisiteit.",
        steps: [
          "(a) Staal → Direkte Materiaal.",
          "(b) Fabriekbestuurder → Fabrieksbokoste.",
          "(c) Samestelling-werkers → Direkte Arbeid.",
          "(d) Fabrieksektrisiteit → Fabrieksbokoste."
        ],
        solution: "(a) Direkte Materiaal; (b) Fabrieksbokoste; (c) Direkte Arbeid; (d) Fabrieksbokoste.",
        commonErrors: [
          "Fabriekbestuurder as direkte arbeid klassifiseer.",
          "Fabrieksektrisiteit as 'n administrasieuitgawe behandel.",
          "Direkte en indirekte koste verwar."
        ]
      }
    ]
  },

  "ACC-4": {
    workedExamplesEn: [
      {
        question: "Prepare a cash budget for June: Opening balance R5 000; Cash sales R40 000; Collections from debtors R15 000; Rent paid R8 000; Wages R12 000; Stock purchases R10 000.",
        steps: [
          "Cash Receipts = Cash sales + Collections = R40 000 + R15 000 = R55 000.",
          "Cash Payments = Rent + Wages + Stock = R8 000 + R12 000 + R10 000 = R30 000.",
          "Net Cash Flow = Receipts − Payments = R55 000 − R30 000 = R25 000.",
          "Closing Balance = Opening + Net Cash Flow = R5 000 + R25 000 = R30 000."
        ],
        solution: "Closing cash balance = R30 000.",
        commonErrors: [
          "Including non-cash items (depreciation) in a cash budget — only actual cash movements.",
          "Forgetting the opening balance when calculating closing balance.",
          "Treating collections from debtors as the same as sales — they are different timing."
        ]
      },
      {
        question: "Budgeted sales = R200 000; Actual sales = R175 000. Calculate the variance and state whether it is favourable or unfavourable.",
        steps: [
          "Variance = Actual − Budget = R175 000 − R200 000 = −R25 000.",
          "For revenue: actual < budget is UNFAVOURABLE (less money received).",
          "State: R25 000 Unfavourable variance in sales."
        ],
        solution: "Sales variance = R25 000 Unfavourable.",
        commonErrors: [
          "Calculating Budget − Actual (getting a positive R25 000) and calling it favourable — for revenue, actual must exceed budget to be favourable.",
          "Applying the same favourable/unfavourable logic to costs: for costs, actual < budget is FAVOURABLE.",
          "Reporting variance without stating favourable/unfavourable."
        ]
      },
      {
        question: "Projected Income Statement: Sales R300 000; Cost of Sales R180 000; Overheads R60 000; Tax rate 28%. Calculate net profit after tax.",
        steps: [
          "Gross Profit = R300 000 − R180 000 = R120 000.",
          "Operating Profit = R120 000 − R60 000 = R60 000.",
          "Tax = 28% × R60 000 = R16 800.",
          "Net Profit After Tax = R60 000 − R16 800 = R43 200."
        ],
        solution: "Net Profit After Tax = R43 200.",
        commonErrors: [
          "Applying tax to gross profit instead of operating/taxable profit.",
          "Confusing projected (forecast) with actual — a projected income statement uses estimates.",
          "Forgetting to deduct overheads before calculating tax."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Berei 'n kontantbegroting vir Junie voor: Opening R5 000; Kontantverkope R40 000; Invordering van debiteure R15 000; Huur R8 000; Lone R12 000; Voorraadaankope R10 000.",
        steps: [
          "Kontantontvangste = R40 000 + R15 000 = R55 000.",
          "Kontantbetalings = R8 000 + R12 000 + R10 000 = R30 000.",
          "Netto Kontantvloei = R55 000 − R30 000 = R25 000.",
          "Sluitingsaldo = R5 000 + R25 000 = R30 000."
        ],
        solution: "Sluitingskontantsaldo = R30 000.",
        commonErrors: [
          "Nie-kontant items (waardevermindering) in 'n kontantbegroting insluit.",
          "Die openingsaldo vergeet.",
          "Invordering van debiteure met verkope as dieselfde behandel."
        ]
      },
      {
        question: "Begrotingsverkope = R200 000; Werklike verkope = R175 000. Bereken die afwyking en stel of dit gunstig of ongunstig is.",
        steps: [
          "Afwyking = Werklik − Begroting = R175 000 − R200 000 = −R25 000.",
          "Vir inkomste: werklik < begroting is ONGUNSTIG.",
          "Stel: R25 000 Ongunstige afwyking in verkope."
        ],
        solution: "Verkoopafwyking = R25 000 Ongunstig.",
        commonErrors: [
          "Begroting − Werklik bereken en dit gunstig noem.",
          "Dieselfde gunstig/ongunstig logika op koste toepas (vir koste is werklik < begroting GUNSTIG).",
          "Afwyking rapporteer sonder gunstig/ongunstig te stel."
        ]
      },
      {
        question: "Geprojekteerde Inkomstestaat: Verkope R300 000; Koste van Verkope R180 000; Bokoste R60 000; Belastingkoers 28%. Bereken netto wins na belasting.",
        steps: [
          "Bruto Wins = R300 000 − R180 000 = R120 000.",
          "Bedryfswin = R120 000 − R60 000 = R60 000.",
          "Belasting = 28% × R60 000 = R16 800.",
          "Netto Wins na Belasting = R60 000 − R16 800 = R43 200."
        ],
        solution: "Netto Wins na Belasting = R43 200.",
        commonErrors: [
          "Belasting op bruto wins toepas in plaas van bedryfswin.",
          "Geprojekteerde (vooruitskatting) met werklike verwar.",
          "Vergeet om bokoste af te trek voor belasting."
        ]
      }
    ]
  },

  "ACC-5": {
    workedExamplesEn: [
      {
        question: "A company bought 100 units at R10, then 50 units at R12. It sold 80 units. Calculate COGS using FIFO and Weighted Average.",
        steps: [
          "FIFO: sell oldest stock first. Sell 80 units @ R10 = R800. COGS = R800.",
          "Closing stock: 20 units @ R10 + 50 units @ R12 = R200 + R600 = R800.",
          "Weighted Average: total cost = (100 × R10) + (50 × R12) = R1 000 + R600 = R1 600; total units = 150; avg cost = R1 600/150 = R10.67/unit.",
          "COGS (WA) = 80 × R10.67 = R853.60. Closing stock = 70 × R10.67 = R746.40."
        ],
        solution: "FIFO COGS = R800; WA COGS = R853.60. FIFO gives lower COGS (higher gross profit) when prices rise.",
        commonErrors: [
          "Under FIFO, selling newer stock first instead of oldest.",
          "Using different unit prices in weighted average — must use overall average.",
          "Not accounting for all units in closing stock check (purchases − sold = closing)."
        ]
      },
      {
        question: "Explain how rising prices affect gross profit under FIFO vs Weighted Average.",
        steps: [
          "Under FIFO, older (cheaper) stock is sold first — COGS is lower.",
          "Lower COGS → higher Gross Profit under FIFO in a rising price environment.",
          "Under WA, a blended (higher) average cost is used — COGS is slightly higher.",
          "Higher COGS → lower Gross Profit under WA in a rising price environment."
        ],
        solution: "Rising prices: FIFO → higher gross profit (lower COGS from cheaper early stock). Weighted Average → lower gross profit (higher blended COGS).",
        commonErrors: [
          "Assuming FIFO always gives higher profit regardless of price direction — this reverses if prices fall.",
          "Forgetting that COGS and Gross Profit move in opposite directions.",
          "Confusing the effect on profit with the effect on closing stock (FIFO gives higher closing stock value when prices rise)."
        ]
      },
      {
        question: "Closing stock = R45 000 (physical count); Perpetual records show R48 000. Identify and journal the adjustment.",
        steps: [
          "Difference = R48 000 − R45 000 = R3 000 inventory shortage.",
          "Cause: theft, damage, recording error, or obsolescence.",
          "Journal: Debit Trading Account (COGS adjustment) R3 000; Credit Inventory R3 000.",
          "Effect: COGS increases by R3 000; Gross Profit decreases by R3 000."
        ],
        solution: "Inventory write-down of R3 000 to correct overstatement in records.",
        commonErrors: [
          "Debiting inventory and crediting income — the write-down is an expense, not revenue.",
          "Not investigating the reason for the discrepancy (theft vs recording error have different internal control implications).",
          "Confusing the direction of the adjustment: physical count lower than records = inventory has decreased."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "100 eenhede teen R10, dan 50 eenhede teen R12. 80 eenhede verkoop. Bereken KVV met EI-EU en Geweegde Gemiddeld.",
        steps: [
          "EI-EU: verkoop oudste voorraad eerste. 80 × R10 = R800. KVV = R800.",
          "Sluitingsvoorraad: 20 × R10 + 50 × R12 = R800.",
          "GG: totale koste = R1 600; totale eenhede = 150; gemiddeld = R10.67.",
          "KVV (GG) = 80 × R10.67 = R853.60."
        ],
        solution: "EI-EU KVV = R800; GG KVV = R853.60.",
        commonErrors: [
          "Onder EI-EU, nuwer voorraad eerste verkoop.",
          "Verskillende eenheids pryse in geweegde gemiddeld gebruik.",
          "Nie alle eenhede in sluitingsvoorraad toerekening."
        ]
      },
      {
        question: "Verduidelik hoe stygende pryse bruto wins beïnvloed onder EI-EU vs Geweegde Gemiddeld.",
        steps: [
          "Onder EI-EU: ouer (goedkoper) voorraad eerste verkoop — KVV is laer.",
          "Laer KVV → hoër Bruto Wins onder EI-EU.",
          "Onder GG: gemengde (hoër) gemiddelde koste — KVV is effens hoër.",
          "Hoër KVV → laer Bruto Wins onder GG."
        ],
        solution: "Stygende pryse: EI-EU → hoër bruto wins; GG → laer bruto wins.",
        commonErrors: [
          "Aanvaar EI-EU gee altyd hoër wins ongeag prysrigting.",
          "Vergeet KVV en Bruto Wins beweeg in teenoorgestelde rigtings.",
          "Effek op wins met effek op sluitingsvoorraad verwar."
        ]
      },
      {
        question: "Fisiese telling: sluitingsvoorraad = R45 000; Perpetuele rekords toon R48 000. Identifiseer en journaliseer die aanpassing.",
        steps: [
          "Verskil = R48 000 − R45 000 = R3 000 voorraadtekort.",
          "Oorsaak: diefstal, skade, rekordingsfout.",
          "Joernaal: Debiteer Handelrekening R3 000; Krediet Voorraad R3 000.",
          "Effek: KVV verhoog met R3 000; Bruto Wins verminder."
        ],
        solution: "Voorraadafskrywing van R3 000.",
        commonErrors: [
          "Voorraad debiteer en inkomste krediteer.",
          "Nie die rede vir die verskil ondersoek nie.",
          "Aanpassingsrigting verwar: fisiese telling laer as rekords = voorraad het verminder."
        ]
      }
    ]
  },

  "ACC-6": {
    workedExamplesEn: [
      {
        question: "Reconcile the bank statement: Bank statement balance R15 000; Outstanding deposit R2 000; Unpresented cheque R800; Bank charges R150 (not in cashbook).",
        steps: [
          "Start with bank statement balance: R15 000.",
          "Add outstanding deposit (in cashbook, not yet on statement): + R2 000.",
          "Subtract unpresented cheque (in cashbook, not yet cleared): − R800.",
          "Adjusted bank balance = R15 000 + R2 000 − R800 = R16 200.",
          "Cashbook must be updated for bank charges: Cashbook balance = R16 200 − R150 = R16 050."
        ],
        solution: "Adjusted Bank Balance = R16 200; Cashbook balance after bank charges = R16 050.",
        commonErrors: [
          "Adding unpresented cheques instead of subtracting — cheques sent but not yet cleared reduce the bank balance.",
          "Adding bank charges to the cashbook instead of subtracting — charges are money leaving the account.",
          "Confusing the direction of reconciliation: you are adjusting both bank and cashbook to reach the true balance."
        ]
      },
      {
        question: "A debtor owes R12 000. After 90 days, you decide to write off R3 000 as irrecoverable. Journal the write-off.",
        steps: [
          "The irrecoverable amount becomes an expense (Bad Debts).",
          "Debit Bad Debts (expense) R3 000.",
          "Credit Debtors Control R3 000 (reduce the amount owed).",
          "Note: the remaining R9 000 is still owed and collectible."
        ],
        solution: "Dr Bad Debts R3 000 / Cr Debtors Control R3 000.",
        commonErrors: [
          "Crediting Revenue instead of Debtors Control — bad debts don't reverse the original sale, they recognise unrecoverability.",
          "Writing off the full R12 000 when only R3 000 is irrecoverable.",
          "Treating bad debts as a balance sheet deduction rather than an income statement expense."
        ]
      },
      {
        question: "Prepare a creditors' reconciliation: Statement balance R25 000; Invoice received but not recorded R3 000; Credit note for return R1 500.",
        steps: [
          "Start: Statement balance R25 000.",
          "Add unrecorded invoice: + R3 000 (we owe more than recorded).",
          "Deduct credit note: − R1 500 (statement should show less after our return).",
          "Adjusted amount: R25 000 + R3 000 − R1 500 = R26 500.",
          "Creditors ledger balance should match R26 500 after adjustments."
        ],
        solution: "Adjusted creditor balance = R26 500.",
        commonErrors: [
          "Adding the credit note instead of subtracting — a credit note reduces the amount owed.",
          "Confusing creditors reconciliation with bank reconciliation — no 'outstanding cheques' concept applies.",
          "Not explaining that unrecorded invoices should be entered into the purchases journal."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Bankrekonsiliasie: Bankstaat R15 000; Uitstaande deposito R2 000; Onaangebiede tjek R800; Bankkostes R150.",
        steps: [
          "Begin: bankstaat R15 000.",
          "Voeg uitstaande deposito by: + R2 000.",
          "Trek onaangebiede tjek af: − R800.",
          "Aangepaste banksaldo = R16 200.",
          "Kontantboek na bankkostes = R16 200 − R150 = R16 050."
        ],
        solution: "Aangepaste Banksaldo = R16 200; Kontantboek = R16 050.",
        commonErrors: [
          "Onaangebiede tjeks bytel in plaas van aftrek.",
          "Bankkostes by kontantboek tel in plaas van aftrek.",
          "Rigting van rekonsiliasie verwar."
        ]
      },
      {
        question: "Skuldenaar skuld R12 000. Na 90 dae skryf jy R3 000 af as oninvorderbaar. Journaliseer.",
        steps: [
          "Slegte Skulde word 'n uitgawe.",
          "Debiteer Slegte Skulde R3 000.",
          "Krediteer Debiteurekontrole R3 000.",
          "Oorblywende R9 000 is steeds skuldig."
        ],
        solution: "Dr Slegte Skulde R3 000 / Kr Debiteurekontrole R3 000.",
        commonErrors: [
          "Inkomste krediteer in plaas van Debiteurekontrole.",
          "Die volle R12 000 afskryf wanneer slegs R3 000 oninvorderbaar is.",
          "Slegte skulde as 'n balansstaat-aftrekking behandel."
        ]
      },
      {
        question: "Krediteure-rekonsiliasie: Staatstaat R25 000; Faktuur ontvang maar nie opgeteken R3 000; Kreditnota vir teruggawe R1 500.",
        steps: [
          "Begin: Staatstaat R25 000.",
          "Voeg onopgetekende faktuur by: + R3 000.",
          "Trek kreditnota af: − R1 500.",
          "Aangepast: R25 000 + R3 000 − R1 500 = R26 500."
        ],
        solution: "Aangepaste krediteure-saldo = R26 500.",
        commonErrors: [
          "Kreditnota bytel in plaas van aftrek.",
          "Krediteure-rekonsiliasie met bankrekonsiliasie verwar.",
          "Nie verduidelik dat onopgetekende fakture in die aankope-joernaal ingeskryf moet word nie."
        ]
      }
    ]
  },

  "ACC-7": {
    workedExamplesEn: [
      {
        question: "Describe three internal control measures over cash receipts.",
        steps: [
          "Segregation of duties: the person who receives cash must NOT be the same person who records it.",
          "Pre-numbered receipts: every cash receipt must be issued a unique sequential receipt number.",
          "Daily banking: all cash received must be banked at the end of each business day.",
          "Independent reconciliation: a person independent of cashier reconciles daily totals."
        ],
        solution: "1. Segregation of duties between receiver and recorder. 2. Pre-numbered receipts. 3. Daily banking of all receipts. 4. Independent reconciliation.",
        commonErrors: [
          "Naming controls without explaining how they prevent fraud — every control must link to a specific risk.",
          "Repeating the same control with different wording.",
          "Treating internal controls as once-off checks rather than ongoing systems."
        ]
      },
      {
        question: "Explain the difference between an unqualified and a qualified audit report, and give a circumstance for each.",
        steps: [
          "Unqualified (clean) report: auditors are satisfied that financial statements give a true and fair view — no material misstatements.",
          "Qualified report: auditors found an issue but it is not pervasive (does not affect the whole picture).",
          "Adverse report: statements are materially misstated across the board.",
          "Disclaimer: auditors could not obtain sufficient evidence to form an opinion."
        ],
        solution: "Unqualified: e.g. financial statements are complete, accurate and comply with IFRS. Qualified: e.g. one subsidiary's records were unavailable — everything else is fine, but that section is excluded from the opinion.",
        commonErrors: [
          "Confusing 'qualified' with 'good' — a qualified audit report is actually a negative finding.",
          "Confusing adverse (all statements wrong) with qualified (specific issue only).",
          "Not linking report types to real business circumstances."
        ]
      },
      {
        question: "Explain the King IV principle of integrated reporting and why it matters for stakeholders.",
        steps: [
          "King IV principle: organisations must produce an integrated report that shows financial and non-financial performance.",
          "Integrated report covers: financial results, environmental impact, social impact (ESG), and governance.",
          "Stakeholder relevance: investors need non-financial information to assess long-term sustainability.",
          "Example: a mine's financial profit means little without understanding its rehabilitation fund status."
        ],
        solution: "King IV requires integrated reporting combining financial (income, balance sheet) and non-financial (environmental, social, governance) information. This allows stakeholders to assess the business holistically — not just its short-term profitability.",
        commonErrors: [
          "Confusing integrated reporting with financial reporting only — the distinction is the inclusion of non-financial aspects.",
          "Treating King IV as a compliance obligation without explaining its stakeholder value.",
          "Not providing an example to ground the explanation."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Beskryf drie interne beheermaatreëls oor kontant-ontvangstes.",
        steps: [
          "Skeiding van pligte: die persoon wat kontant ontvang moet NIE dieselfde persoon wees wat dit opteken nie.",
          "Vooraf-genommerde ontvangsbewyse: elke kontantontvangsbewys moet 'n unieke volgorde nommer hê.",
          "Daaglikse bankstorting: alle kontant moet aan die einde van elke besigheidsdag gebankier word.",
          "Onafhanklike rekonsiliasie: 'n onafhanklike persoon versoen daaglikse totale."
        ],
        solution: "1. Skeiding van pligte. 2. Vooraf-genommerde ontvangsbewyse. 3. Daaglikse bankstorting. 4. Onafhanklike rekonsiliasie.",
        commonErrors: [
          "Beheermaatreëls noem sonder te verduidelik hoe hulle bedrog voorkom.",
          "Dieselfde beheer met verskillende bewoording herhaal.",
          "Interne beheer as eenmalige kontroles behandel."
        ]
      },
      {
        question: "Verduidelik die verskil tussen 'n onbevoegde en gekwalifiseerde ouditverslag.",
        steps: [
          "Onbevoegde (skoon) verslag: ouditeure is tevrede dat finansiële state 'n ware en regverdige beeld gee.",
          "Gekwalifiseerde verslag: ouditeure het 'n probleem gevind maar dit is nie deurlopend nie.",
          "Nadelige verslag: state is wesentlik verkeerd oor die geheel.",
          "Vrywaring: ouditeure kon nie voldoende bewys kry nie."
        ],
        solution: "Onbevoegd: bv. finansiële state is volledig en voldoen aan IFRS. Gekwalifiseerd: bv. een filiaal se rekords was onbeskikbaar — alles anders is reg.",
        commonErrors: [
          "'Gekwalifiseerd' met 'goed' verwar — 'n gekwalifiseerde verslag is 'n negatiewe bevinding.",
          "Nadelig (alles verkeerd) met gekwalifiseerd (spesifieke probleem slegs) verwar.",
          "Verslagtipes nie aan werklike besigheidsomstandighede koppel nie."
        ]
      },
      {
        question: "Verduidelik die King IV-beginsel van geïntegreerde verslagdoening en hoekom dit vir aandeelhouers belangrik is.",
        steps: [
          "King IV: organisasies moet 'n geïntegreerde verslag produseer wat finansiële en nie-finansiële prestasie toon.",
          "Geïntegreerde verslag dek: finansiële resultate, omgewingsimpak, sosiale impak (ESG) en bestuur.",
          "Aandeelhouersrelevansie: beleggers het nie-finansiële inligting nodig om langtermyn-volhoubaarheid te assesseer.",
          "Voorbeeld: 'n myn se finansiële wins beteken min sonder begrip van sy rehabilitasiefondsstatus."
        ],
        solution: "King IV vereis geïntegreerde verslagdoening wat finansiële (inkomste, balansstaat) en nie-finansiële (omgewing, sosiaal, bestuur) inligting kombineer.",
        commonErrors: [
          "Geïntegreerde verslagdoening met slegs finansiële verslagdoening verwar.",
          "King IV as 'n nakomingsverpligting behandel sonder die aandeelhouerswaarde te verduidelik.",
          "Nie 'n voorbeeld verskaf nie."
        ]
      }
    ]
  },

  "ACC-8": {
    workedExamplesEn: [
      {
        question: "Explain two ways in which fraud can occur in a small business and two preventive controls for each.",
        steps: [
          "Fraud type 1: Embezzlement (employee steals cash). Prevention: daily banking of all receipts; surprise cash counts.",
          "Fraud type 2: Ghost employees on payroll. Prevention: HR must approve all new employees; regular payroll audits by an independent party.",
          "Fraud type 3: Fictitious supplier invoices. Prevention: three-way matching (purchase order, delivery note, invoice); segregation between ordering and payment."
        ],
        solution: "Embezzlement → daily banking + surprise counts. Ghost employees → HR approval + payroll audits. Fictitious invoices → three-way matching + segregation.",
        commonErrors: [
          "Naming fraud types without explaining how they work operationally.",
          "Providing only one control per fraud type when two are required.",
          "Not connecting each control to the specific fraud it prevents."
        ]
      },
      {
        question: "Define corporate social investment (CSI) and give two examples of CSI activities for a mining company.",
        steps: [
          "CSI definition: a business's voluntary investment in community development beyond its legal obligations.",
          "Distinguish from corporate social responsibility (CSR): CSR is ongoing ethical conduct; CSI is specific investment projects.",
          "Mining company CSI example 1: bursary programme for local community learners to study mining engineering.",
          "Mining company CSI example 2: building a water purification plant for a rural community affected by mining operations."
        ],
        solution: "CSI = voluntary community investment beyond legal obligation. Examples: bursaries for local learners; community water infrastructure.",
        commonErrors: [
          "Confusing CSI (specific investment projects) with CSR (general ethical business conduct).",
          "Choosing CSI examples unrelated to the company's core operations or community context.",
          "Treating mandatory social and labour plans (SLPs, required by mining law) as CSI — CSI is voluntary."
        ]
      },
      {
        question: "Explain the whistleblower protection under the Protected Disclosures Act (PDA) and why it matters for good governance.",
        steps: [
          "PDA definition: South African law protecting employees who report workplace wrongdoing in good faith.",
          "Protection provided: employer cannot dismiss, demote, harass or discipline a whistleblower for a protected disclosure.",
          "Conditions: disclosure must be made to an appropriate authority (internal, regulatory, or public).",
          "Governance importance: without protection, employees fear retaliation — wrongdoing goes unreported; with protection, internal controls are strengthened."
        ],
        solution: "The PDA protects good-faith disclosures of workplace wrongdoing. Key governance benefit: employees feel safe to report fraud, removing fear of retaliation and strengthening internal controls.",
        commonErrors: [
          "Confusing the PDA with the Companies Act — the PDA specifically governs whistleblower protection, not general company law.",
          "Treating whistleblowing as anonymous reporting — the PDA protects identified reporters who act in good faith, not necessarily anonymous ones.",
          "Not explaining the link between whistleblower protection and governance effectiveness."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik twee maniere waarop bedrog in 'n klein besigheid kan plaasvind en twee voorkomende beheermaatreëls vir elk.",
        steps: [
          "Bedrogtipe 1: Verduistering (werknemer steel kontant). Voorkoming: daaglikse bankstorting; verrassende kontant-tellings.",
          "Bedrogtipe 2: Spookwerknemers op betaalstaat. Voorkoming: MH moet alle nuwe werknemers goedkeur; gereelde betaalstaatoudits.",
          "Bedrogtipe 3: Fiktiewe leveranciersfakture. Voorkoming: drie-weg-passing; skeiding van bestel en betaalopdrag."
        ],
        solution: "Verduistering → daaglikse bankstorting + verrassende tellings. Spookwerknemers → MH-goedkeuring + betaalstaatoudits. Fiktiewe fakture → drie-weg-passing + skeiding.",
        commonErrors: [
          "Bedrogtipes noem sonder te verduidelik hoe hulle werk.",
          "Slegs een beheer per bedrogtipe wanneer twee vereis word.",
          "Nie elke beheer aan die spesifieke bedrog wat dit voorkom koppel nie."
        ]
      },
      {
        question: "Definieer korporatiewe sosiale belegging (KSB) en gee twee voorbeelde van KSB-aktiwiteite vir 'n mynmaatskappy.",
        steps: [
          "KSB-definisie: 'n besigheid se vrywillige belegging in gemeenskapsontwikkeling bo sy wetlike verpligtings.",
          "Onderskei van KSV (korporatiewe sosiale verantwoordelikheid): KSV is voortdurende etiese gedrag; KSB is spesifieke beleggingsprojekte.",
          "Mynmaatskappy KSB voorbeeld 1: beursprogramma vir plaaslike gemeenskapsleerders.",
          "Mynmaatskappy KSB voorbeeld 2: watersuiweringsaanleg vir 'n landelike gemeenskap."
        ],
        solution: "KSB = vrywillige gemeenskapsbelegging bo wetlike verpligting. Voorbeelde: beurse; gemeenskapswaterinfrastruktuur.",
        commonErrors: [
          "KSB (spesifieke beleggingsprojekte) met KSV (algemene etiese besigheidsgedrag) verwar.",
          "KSB-voorbeelde kies wat nie verband hou met die maatskappy se kernbedrywighede nie.",
          "Verpligte sosiale en arbeidsplanne as KSB behandel — KSB is vrywillig."
        ]
      },
      {
        question: "Verduidelik die klokkluider-beskerming onder die Wet op Beskermde Openbaarmakings (WBO) en hoekom dit vir goeie bestuur belangrik is.",
        steps: [
          "WBO-definisie: SA-wet wat werknemers beskerm wat werkplekwangedrag ter goede trou rapporteer.",
          "Beskerming: werkgewer kan nie 'n klokkluider afdank, degradeer of teister nie.",
          "Voorwaardes: openbaarmaking moet aan 'n gepaste gesag gemaak word.",
          "Bestuur se belang: sonder beskerming vrees werknemers vergelding — wangedrag word nie gerapporteer nie."
        ],
        solution: "Die WBO beskerm ter goede trou-openbaarmakings. Sleutel bestuur-voordeel: werknemers voel veilig om bedrog te rapporteer.",
        commonErrors: [
          "WBO met die Maatskappywet verwar.",
          "Klokkluiding as anonieme verslagdoening behandel — die WBO beskerm geïdentifiseerde verslaggewers.",
          "Nie die verband tussen klokkluider-beskerming en bestuursdoeltreffendheid verduidelik nie."
        ]
      }
    ]
  },

  // ===================== BUSINESS STUDIES (BUS) =====================

  "BUS-1": {
    workedExamplesEn: [
      {
        question: "Conduct a SWOT analysis for a small South African coffee shop operating near a university campus.",
        steps: [
          "Strengths (internal, positive): prime location, loyal student customer base, low overhead from small space.",
          "Weaknesses (internal, negative): limited menu, no delivery service, small seating capacity.",
          "Opportunities (external, positive): growing coffee culture in SA, option to add delivery via Mr D or Uber Eats, student population grows annually.",
          "Threats (external, negative): large chains (Starbucks, Vida e Caffè) nearby, electricity outages, economic downturn reducing student spending."
        ],
        solution: "SWOT: S = location + loyalty; W = limited menu + no delivery; O = delivery platforms + growing market; T = chain competition + load-shedding.",
        commonErrors: [
          "Confusing internal (S/W) and external (O/T) factors — strengths and weaknesses are internal to the business.",
          "Listing the same factor in both strengths and opportunities.",
          "Writing generic SWOT points not specific to this business."
        ]
      },
      {
        question: "Apply Porter's Five Forces to the South African fast food industry.",
        steps: [
          "Rivalry (competitive intensity): high — McDonald's, KFC, Steers, Nando's all compete intensely on price and product.",
          "Threat of new entrants: low-medium — high capital to establish chain; established brand loyalty is a barrier.",
          "Threat of substitutes: high — home cooking, street food, sit-down restaurants all compete.",
          "Bargaining power of suppliers: medium — large chains have negotiating power; small players don't.",
          "Bargaining power of buyers: high — consumers have many alternatives and are price-sensitive."
        ],
        solution: "Overall industry attractiveness: moderate — high rivalry and buyer power reduce profitability; brand loyalty partially protects incumbents.",
        commonErrors: [
          "Treating Five Forces as a simple list rather than an interconnected analysis.",
          "Confusing 'rivalry' (current competitors) with 'threat of new entrants' (potential future competitors).",
          "Not stating the overall conclusion about industry attractiveness after analysing the forces."
        ]
      },
      {
        question: "Describe the macro environment factors that could affect a South African retail business using PESTLE.",
        steps: [
          "Political: government policy on minimum wages; BEE requirements; import tariffs.",
          "Economic: interest rate changes affect consumer spending; rand depreciation raises import costs.",
          "Social: urbanisation shifts where customers live and shop; changing lifestyle preferences.",
          "Technological: e-commerce growth; mobile payment adoption.",
          "Legal: Consumer Protection Act (CPA) rights; labour legislation.",
          "Environmental: load-shedding affects trading hours; sustainability consumer preference."
        ],
        solution: "PESTLE for SA retailer: BEE compliance (P), rand weakness (E), urbanisation (S), e-commerce (T), CPA obligations (L), load-shedding (En).",
        commonErrors: [
          "Confusing PESTLE (macro environment) with market forces (competitors, suppliers) — these are separate levels of analysis.",
          "Applying PESTLE generically rather than specifically to SA retail context.",
          "Omitting the Environmental component — load-shedding is a significant environmental factor in SA."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Doen 'n SWOT-analise vir 'n klein Suid-Afrikaanse koffiewinkel naby 'n universiteitskampus.",
        steps: [
          "Sterkpunte (intern, positief): prima ligging, lojale studentekliëntebasis, lae bokoste.",
          "Swakpunte (intern, negatief): beperkte spyskaart, geen afleweringsdiens, klein sittingskapasiteit.",
          "Geleenthede (ekstern, positief): groeiende koffiekultuur, Mr D/Uber Eats-opsie, groeiende studentebevolking.",
          "Bedreigings (ekstern, negatief): groot kettings, kragonderbrekings, ekonomiese afswaai."
        ],
        solution: "SWOT: S = ligging + lojaliteit; W = beperkte spyskaart + geen aflewering; G = aflewering + groeiende mark; B = kettingmededinging + beurtkrag.",
        commonErrors: [
          "Interne (S/W) en eksterne (G/B) faktore verwar.",
          "Dieselfde faktor in beide S en G lys.",
          "Generiese SWOT-punte skryf nie spesifiek aan hierdie besigheid nie."
        ]
      },
      {
        question: "Pas Porter se Vyf Kragte toe op die Suid-Afrikaanse vinnige kos-industrie.",
        steps: [
          "Mededinging: hoog — McDonald's, KFC, Steers, Nando's meeding intensief.",
          "Bedreiging van nuwe toetreders: laag-medium — hoë kapitaalvereistes; handelsmerklojalteit.",
          "Bedreiging van substitute: hoog — tuiskook, straatetens, restaurante.",
          "Bedingingsmag van verskaffers: medium.",
          "Bedingingsmag van kopers: hoog — verbruikers het baie alternatiewe."
        ],
        solution: "Algehele industrie-aantreklikheid: matig — hoë mededinging en kopermag verminder winsgewendheid.",
        commonErrors: [
          "Vyf Kragte as 'n eenvoudige lys behandel eerder as 'n samehangende analise.",
          "'Mededinging' met 'bedreiging van nuwe toetreders' verwar.",
          "Nie 'n algehele gevolgtrekking oor industrie-aantreklikheid stel nie."
        ]
      },
      {
        question: "Beskryf makro-omgewingsfaktore wat 'n SA-kleinhandelbesigheid kan beïnvloed met PESTLE.",
        steps: [
          "Polities: minimumloonbeleid; SEB-vereistes; invoertariewe.",
          "Ekonomies: rentekoersveranderinge; rand-swakheid.",
          "Sosiaal: verstedeliking; veranderende lewenstylvoorkeure.",
          "Tegnologies: e-handel groei; mobiele betalings.",
          "Wettig: Wet op Verbruikersbeskerming; arbeidswetgewing.",
          "Omgewings: beurtkrag; volhoubaarheidsvoorkeure."
        ],
        solution: "PESTLE vir SA-kleinhandelaar: SEB (P), randswakheid (E), verstedeliking (S), e-handel (T), WVB-verpligtings (W), beurtkrag (Om).",
        commonErrors: [
          "PESTLE (makro-omgewing) met markkragte (mededingers, verskaffers) verwar.",
          "PESTLE generies toepas eerder as SA-konteks.",
          "Die Omgewingskomponent weglaat."
        ]
      }
    ]
  },

  "BUS-2": {
    workedExamplesEn: [
      {
        question: "Explain Total Quality Management (TQM) and describe three of its key principles.",
        steps: [
          "Define TQM: a management philosophy where every aspect of the organisation focuses on meeting customer needs through continuous improvement.",
          "Principle 1 — Customer focus: every decision is evaluated by whether it improves customer satisfaction.",
          "Principle 2 — Total employee involvement: all staff at every level participate in quality improvement.",
          "Principle 3 — Continuous improvement (Kaizen): small, ongoing improvements rather than one-off large changes."
        ],
        solution: "TQM = customer-focused, organisation-wide quality philosophy. Key principles: customer focus, total participation, continuous improvement (Kaizen).",
        commonErrors: [
          "Describing quality control (inspecting finished products) instead of TQM (building quality into every process).",
          "Treating TQM as a department rather than a philosophy affecting the whole organisation.",
          "Listing principles without explaining what each one means in practice."
        ]
      },
      {
        question: "Explain what a quality circle is and give two potential benefits for a manufacturing business.",
        steps: [
          "Definition: a voluntary group of employees who regularly meet to identify, analyse and solve quality-related work problems.",
          "Benefit 1: employee empowerment — workers feel valued and ownership of quality improves motivation.",
          "Benefit 2: expert insight — employees on the factory floor often notice quality problems that management cannot see from above.",
          "Link to TQM: quality circles are a practical TQM tool for achieving total participation."
        ],
        solution: "Quality circle = voluntary employee group solving quality problems. Benefits: empowerment (motivation) and expert floor-level insight (practical solutions).",
        commonErrors: [
          "Confusing quality circles with management committees — quality circles are voluntary and led by workers, not management.",
          "Listing benefits without explaining why they matter to the business.",
          "Not linking quality circles to the broader TQM philosophy."
        ]
      },
      {
        question: "A business achieves ISO 9001 certification. Explain what this means and give two benefits for the business.",
        steps: [
          "ISO 9001: an international quality management standard issued by the International Organisation for Standardisation.",
          "Meaning: the business has demonstrated its quality management system meets internationally recognised requirements.",
          "Benefit 1: credibility and access to new markets — international buyers and tenders often require ISO certification.",
          "Benefit 2: internal efficiency — the ISO process forces the business to document and standardise procedures, reducing errors."
        ],
        solution: "ISO 9001 certifies an internationally recognised QMS. Benefits: market credibility and internal process efficiency.",
        commonErrors: [
          "Confusing ISO 9001 (quality management) with ISO 14001 (environmental management) — different standards for different areas.",
          "Treating ISO certification as a product quality guarantee — it certifies the management system, not the product itself.",
          "Not explaining how ISO benefits the business operationally."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik Totale Kwaliteitbestuur (TKB) en beskryf drie sleutelbeginsels.",
        steps: [
          "Definieer TKB: 'n bestuursfilosofie waar elke aspek van die organisasie fokus op kliëntebehoeftes deur voortdurende verbetering.",
          "Beginsel 1 — Kliëntfokus: elke besluit word geëvalueer of dit kliëntebevrediging verbeter.",
          "Beginsel 2 — Totale werknemersbetrokkenheid: alle personeel deelneem aan kwaliteitsverbetering.",
          "Beginsel 3 — Voortdurende verbetering (Kaizen): klein, deurlopende verbeterings."
        ],
        solution: "TKB = kliëntgefokusde, organisasie-wye kwaliteitsfilosofie. Beginsels: kliëntfokus, totale deelname, voortdurende verbetering.",
        commonErrors: [
          "Kwaliteitsbeheer (voltooide produk inspeksie) in plaas van TKB (kwaliteit in elke proses) beskryf.",
          "TKB as 'n departement behandel eerder as 'n hele-organisasie-filosofie.",
          "Beginsels lys sonder te verduidelik wat elkeen in praktyk beteken."
        ]
      },
      {
        question: "Verduidelik wat 'n kwaliteitsirkel is en gee twee potensiële voordele vir 'n vervaardigingsbesigheid.",
        steps: [
          "Definisie: 'n vrywillige groep werknemers wat gereeld vergader om kwaliteitsverwante probleme op te los.",
          "Voordeel 1: werknemersbemagtiging — werkers voel gewaardeer en eienaarskap van kwaliteit verbeter motivering.",
          "Voordeel 2: kundige insig — werkers op die fabrieksvloer merk dikwels kwaliteitsprobleme wat bestuur van bo nie kan sien nie."
        ],
        solution: "Kwaliteitsirkel = vrywillige werknemersgroep. Voordele: bemagtiging (motivering) en kundige vloerinsig.",
        commonErrors: [
          "Kwaliteitsirkel met bestuurskomitees verwar — vrywillig en deur werkers gelei.",
          "Voordele lys sonder te verduidelik hoekom hulle vir die besigheid saak maak.",
          "Kwaliteitsirkels nie aan die breër TKB-filosofie koppel nie."
        ]
      },
      {
        question: "Besigheid behaal ISO 9001-sertifisering. Verduidelik wat dit beteken en gee twee voordele.",
        steps: [
          "ISO 9001: internasionale kwaliteitsbestuurstandaard.",
          "Betekenis: die besigheid se KBS voldoen aan internasionaal erkende vereistes.",
          "Voordeel 1: geloofwaardigheid — internasionale kopers vereis ISO-sertifisering.",
          "Voordeel 2: interne doeltreffendheid — ISO dwing die besigheid om prosedures te dokumenteer."
        ],
        solution: "ISO 9001 sertifiseer 'n internasionaal erkende KBS. Voordele: markgeloofwaardigheid en proses-doeltreffendheid.",
        commonErrors: [
          "ISO 9001 (kwaliteitsbestuur) met ISO 14001 (omgewingsbestuur) verwar.",
          "ISO-sertifisering as 'n produkgaransie behandel.",
          "Nie verduidelik hoe ISO die besigheid bedryfsmatig bevoordeel nie."
        ]
      }
    ]
  },

  "BUS-3": {
    workedExamplesEn: [
      {
        question: "Compare a sole proprietorship and a private company (Pty Ltd) in terms of registration, liability, and continuity.",
        steps: [
          "Sole proprietorship: no formal registration required; unlimited personal liability; dissolves on owner's death.",
          "Private company (Pty Ltd): registered with the Companies and Intellectual Property Commission (CIPC); limited liability (shareholders' personal assets protected); continues to exist independent of shareholders.",
          "Tax treatment: sole proprietor taxed as individual; Pty Ltd taxed at corporate tax rate (currently 27%)."
        ],
        solution: "Sole proprietorship: simple/cheap, but unlimited liability and no continuity. Pty Ltd: registered, limited liability, perpetual succession — better protection but more compliance.",
        commonErrors: [
          "Saying a Pty Ltd has 'no liability' — shareholders have limited liability, but the company still has liabilities.",
          "Confusing a private company (Pty Ltd) with a public company (Ltd) — private cannot offer shares to the public.",
          "Ignoring registration requirements — CIPC registration is a key distinction."
        ]
      },
      {
        question: "Explain the difference between insurable and non-insurable risk, with one example of each in a business context.",
        steps: [
          "Insurable risk: a risk with a quantifiable monetary value, where the event is accidental, definite, measurable, and not catastrophic enough to make insurance uneconomical.",
          "Example: fire damage to business premises — quantifiable, accidental, can be insured.",
          "Non-insurable risk: risk that cannot be transferred to an insurer because it is speculative (the outcome could be gain or loss).",
          "Example: launching a new product — the business might profit or lose; insurers won't cover speculative business decisions."
        ],
        solution: "Insurable: fire, theft, injury (accidental losses). Non-insurable: market risk, competitor actions, strategic decisions (speculative outcomes).",
        commonErrors: [
          "Treating all risks as insurable — speculative risks cannot be insured.",
          "Confusing risk transfer (insurance) with risk retention (setting aside reserves).",
          "Giving only one example when both insurable and non-insurable are required."
        ]
      },
      {
        question: "Describe the key elements of a valid contract in South African law.",
        steps: [
          "Consensus (agreement): both parties must intend to contract (no duress, fraud or misrepresentation).",
          "Capacity: parties must be legally competent (adults, not intoxicated, not mentally incapable).",
          "Possibility: the obligation must be physically and legally possible to perform.",
          "Legality: the contract must not violate any law.",
          "Formalities: some contracts require specific form (e.g. in writing) — e.g. sale of land."
        ],
        solution: "Valid contract requires: consensus, capacity, possibility, legality, and compliance with formalities where required.",
        commonErrors: [
          "Omitting capacity — a contract with a minor (under 18) without guardian consent is voidable.",
          "Treating illegality as automatically void — some illegal contracts are void ab initio, others voidable.",
          "Stating that all contracts must be in writing — verbal contracts are valid unless the law requires written form."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Vergelyk 'n alleeneienaarskap en 'n privaat maatskappy (Edms Bpk) ten opsigte van registrasie, aanspreeklikheid en kontinuïteit.",
        steps: [
          "Alleeneienaarskap: geen formele registrasie; onbeperkte persoonlike aanspreeklikheid; ontbind by eienaar se dood.",
          "Privaat maatskappy (Edms Bpk): geregistreer by SEKK; beperkte aanspreeklikheid; voortgesette bestaan onafhanklik van aandeelhouers.",
          "Belastingbehandeling: alleeneienaar as individu belas; Edms Bpk teen korporatiewe belastingkoers."
        ],
        solution: "Alleeneienaarskap: eenvoudig maar onbeperkte aanspreeklikheid. Edms Bpk: geregistreerd, beperkte aanspreeklikheid, ewigdurende opvolging.",
        commonErrors: [
          "Sê 'n Edms Bpk het 'geen aanspreeklikheid' — aandeelhouers het beperkte aanspreeklikheid, maar die maatskappy het steeds laste.",
          "'n Privaat maatskappy (Edms Bpk) met 'n openbare maatskappy (Bpk) verwar.",
          "Registrasievereistes ignoreer."
        ]
      },
      {
        question: "Verduidelik die verskil tussen versekerende en nie-versekerende risiko, met een voorbeeld van elk.",
        steps: [
          "Versekerende risiko: 'n risiko met 'n kwantifiseerbare monetêre waarde, toeval, meetbaar.",
          "Voorbeeld: brandskaade aan bedryfsgebou.",
          "Nie-versekerende risiko: spekulatiewe risiko — uitkoms kan wins of verlies wees.",
          "Voorbeeld: nuwe produk bekendstelling."
        ],
        solution: "Versekerende: brand, diefstal, besering. Nie-versekerende: markrisiko, mededinger aksies, strategiese besluite.",
        commonErrors: [
          "Alle risiko's as versekerende behandel.",
          "Risikooorplasing (versekering) met risiko-aanhouding (reserwes) verwar.",
          "Slegs een voorbeeld gee wanneer beide vereis word."
        ]
      },
      {
        question: "Beskryf die sleutelelemente van 'n geldige kontrak in SA-reg.",
        steps: [
          "Konsensus: beide partye moet bedoel om te kontrakteer (geen dwang, bedrog).",
          "Bevoegdheid: partye moet wetlik bevoeg wees.",
          "Moontlikheid: die verpligting moet fisies en wetlik uitvoerbaar wees.",
          "Wettigheid: nie in stryd met enige wet nie.",
          "Formaliteite: sommige kontrakte vereis 'n spesifieke vorm (bv. skriftelik)."
        ],
        solution: "Geldige kontrak vereis: konsensus, bevoegdheid, moontlikheid, wettigheid en nakoming van formaliteite.",
        commonErrors: [
          "Bevoegdheid weglaat.",
          "Wetlike ongeldigheid as outomaties nietig behandel.",
          "Sê alle kontrakte moet skriftelik wees."
        ]
      }
    ]
  },

  "BUS-4": {
    workedExamplesEn: [
      {
        question: "Explain the four functions of management (POLC) with a practical example for each in a school tuck shop.",
        steps: [
          "Planning: setting goals and strategies — e.g. deciding to increase sales by 20% in Term 2 by adding healthy snacks.",
          "Organising: allocating resources and tasks — e.g. assigning two Grade 11s to serve, one to stock, one to cash.",
          "Leading: motivating and directing staff — e.g. recognising the best-performing server with a 'star server' badge.",
          "Controlling: monitoring performance against goals — e.g. comparing weekly sales figures to the 20% target."
        ],
        solution: "POLC: Plan (set goals), Organise (allocate resources), Lead (motivate), Control (measure performance).",
        commonErrors: [
          "Treating leading and managing as identical — leading focuses on motivation and vision; managing includes administration.",
          "Not providing practical examples — abstract definitions score limited marks.",
          "Listing functions in the wrong order — POLC implies a logical sequence though all functions are interdependent."
        ]
      },
      {
        question: "Describe three leadership styles and explain when each is most effective.",
        steps: [
          "Autocratic: leader makes all decisions alone — effective in emergencies or with unskilled workers requiring clear direction.",
          "Democratic: leader consults team before deciding — effective with skilled, experienced teams where buy-in matters.",
          "Laissez-faire: leader gives freedom to team members — effective with highly skilled, self-motivated professionals (e.g. research teams)."
        ],
        solution: "Autocratic = control in emergencies; Democratic = participation for skilled teams; Laissez-faire = freedom for expert autonomous workers.",
        commonErrors: [
          "Describing leadership styles as universally 'good' or 'bad' — effectiveness depends on context.",
          "Confusing democratic leadership with majority voting — the leader still makes the final decision after consultation.",
          "Not stating the situational condition for effectiveness."
        ]
      },
      {
        question: "Explain the difference between Authority, Responsibility, and Accountability in a business context.",
        steps: [
          "Authority: the formal right to make decisions and give instructions (flows downward from management).",
          "Responsibility: the obligation to perform assigned tasks (accepted when delegated authority is received).",
          "Accountability: answering for outcomes of decisions and actions — cannot be delegated; remains with the delegating manager."
        ],
        solution: "Authority = right to decide; Responsibility = obligation to perform; Accountability = answering for results. Accountability always stays with the delegator.",
        commonErrors: [
          "Stating that accountability can be delegated — it cannot; only authority and responsibility can be delegated.",
          "Treating authority and power as identical — authority is formal/positional; power can be informal.",
          "Not explaining that authority must be commensurate with responsibility for management to work effectively."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die vier bestuursfunksies (BOLB) met 'n praktiese voorbeeld vir elk in 'n skoolkafeteria.",
        steps: [
          "Beplanning: doelwitte en strategieë stel — bv. verkope met 20% in Term 2 verhoog.",
          "Organisering: hulpbronne en take toewys — bv. twee Graad 11's bedien, een vul voorraad.",
          "Leiding: personeel motiveer en rig — bv. beste bediener erken.",
          "Beheer: prestasie teen doelwitte monitor — bv. weeklikse verkope met 20%-teiken vergelyk."
        ],
        solution: "BOLB: Beplan (doelwitte), Organiseer (hulpbronne), Leiding (motiveer), Beheer (prestasie meet).",
        commonErrors: [
          "Leiding en bestuur as identies behandel.",
          "Geen praktiese voorbeelde gee nie.",
          "Funksies in die verkeerde volgorde lys."
        ]
      },
      {
        question: "Beskryf drie leierskapstyle en verduidelik wanneer elkeen die doeltreffendste is.",
        steps: [
          "Outokraties: leier neem alle besluite alleen — doeltreffend in noodsituasies.",
          "Demokraties: leier raadpleeg span — doeltreffend met vaardige, ervare spanne.",
          "Laissez-faire: leier gee vryheid aan spanlede — doeltreffend met hoogsgeskoolde, selfgemotiveerde professioneles."
        ],
        solution: "Outokraties = beheer in noodgevalle; Demokraties = deelname vir vaardige spanne; Laissez-faire = vryheid vir kundige outonome werkers.",
        commonErrors: [
          "Leierskapstyle as universeel 'goed' of 'sleg' beskryf.",
          "Demokratiese leierskap met meerderheidsstemming verwar.",
          "Nie die situasionele toestand vir doeltreffendheid stel nie."
        ]
      },
      {
        question: "Verduidelik die verskil tussen Gesag, Verantwoordelikheid en Aanspreeklikheid.",
        steps: [
          "Gesag: die formele reg om besluite te neem (vloei afwaarts van bestuur).",
          "Verantwoordelikheid: die verpligting om toegewysde take uit te voer.",
          "Aanspreeklikheid: antwoord vir uitkomste — kan nie gedelegeer word nie."
        ],
        solution: "Gesag = reg om te besluit; Verantwoordelikheid = verpligting om uit te voer; Aanspreeklikheid = antwoord vir resultate. Aanspreeklikheid bly altyd by die delegeerder.",
        commonErrors: [
          "Sê aanspreeklikheid kan gedelegeer word — dit kan nie.",
          "Gesag en mag as identies behandel.",
          "Nie verduidelik dat gesag en verantwoordelikheid gebalanseer moet wees nie."
        ]
      }
    ]
  },

  "BUS-5": {
    workedExamplesEn: [
      {
        question: "Explain the marketing mix (7 Ps) with one example for each element for a new South African energy drink brand.",
        steps: [
          "Product: sugar-free energy drink in recyclable cans; unique SA flavours (rooibos, marula).",
          "Price: R25/can — premium but accessible; R85 for 4-pack.",
          "Place: Checkers, Woolworths, universities, gyms, online.",
          "Promotion: Instagram influencers; DJ partnerships at events; student discounts.",
          "People: knowledgeable brand ambassadors at events.",
          "Process: online order delivered within 2 hours in major cities.",
          "Physical evidence: bold, distinctive can design; refrigerator displays."
        ],
        solution: "7 Ps for SA energy drink: Product (SA flavours), Price (R25 premium), Place (retail + online), Promotion (social media), People (ambassadors), Process (fast delivery), Physical evidence (distinctive packaging).",
        commonErrors: [
          "Using only 4 Ps (Product, Price, Place, Promotion) — modern marketing uses 7 Ps for service businesses.",
          "Applying elements generically rather than specifically to the product.",
          "Confusing 'Place' with location — it means distribution channels, not just physical premises."
        ]
      },
      {
        question: "Describe three market research methods and the advantage of each for a small business.",
        steps: [
          "Survey/questionnaire: structured questions asked to a sample — advantage: quantifiable data from many respondents at low cost.",
          "Focus group: facilitated discussion with a small representative group — advantage: rich qualitative insight into attitudes and feelings.",
          "Observation: watching customers interact with products in-store — advantage: captures real behaviour without bias from self-reporting."
        ],
        solution: "Survey (quantitative + affordable), Focus group (qualitative insight), Observation (behavioural authenticity).",
        commonErrors: [
          "Treating all market research as surveys — the three methods have different data types and uses.",
          "Not explaining the specific advantage — each method's strength depends on what kind of information is needed.",
          "Confusing primary (original) and secondary (existing) research — all three above are primary."
        ]
      },
      {
        question: "Explain product lifecycle stages and identify an appropriate marketing strategy for each.",
        steps: [
          "Introduction: low sales, high costs, building awareness — strategy: heavy promotion, skimming or penetration pricing.",
          "Growth: rapidly rising sales — strategy: expand distribution, differentiate from imitators.",
          "Maturity: peak sales, intense competition — strategy: product extensions, competitive pricing, loyalty programmes.",
          "Decline: falling sales — strategy: reduce costs, target loyal niche, consider discontinuation."
        ],
        solution: "PLC: Intro (awareness promotion), Growth (expand + differentiate), Maturity (extend + retain), Decline (cost-cut or discontinue).",
        commonErrors: [
          "Treating the PLC as a fixed timeline — some products skip stages or return from decline.",
          "Only describing stages without recommending strategies.",
          "Confusing the PLC with the business cycle (boom/bust) — PLC is product-specific."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die bemarkingsmengsel (7 P's) met een voorbeeld vir elk vir 'n nuwe Suid-Afrikaanse energiedrank-handelsmerk.",
        steps: [
          "Produk: suikervrye energiedrank in herwinbare blikke; unieke SA geure.",
          "Prys: R25/blik — premium maar toeganklik.",
          "Plek: Checkers, Woolworths, universiteite, aanlyn.",
          "Bevordering: Instagram-invloedrykes; studente-afslag.",
          "Mense: kundige handelsmerkalfas by geleenthede.",
          "Proses: aanlyn bestelling binne 2 uur afgelewer.",
          "Fisiese bewys: opvallende blikontwerp; verkoelingstaanders."
        ],
        solution: "7 P's vir SA-energiedrank: Produk (SA-geure), Prys (R25 premium), Plek (kleinhandel + aanlyn), Bevordering (sosiale media), Mense (boodskapsbeamptes), Proses (vinnige aflewering), Fisiese bewys (onderskeidende verpakking).",
        commonErrors: [
          "Slegs 4 P's gebruik — moderne bemarking gebruik 7 P's.",
          "Elemente generies toepas eerder as spesifiek aan die produk.",
          "'Plek' met fisiese ligging verwar — dit beteken verspreiding-kanale."
        ]
      },
      {
        question: "Beskryf drie marknavorsingsmetodes en die voordeel van elkeen vir 'n klein besigheid.",
        steps: [
          "Vraelys: gestruktureerde vrae aan 'n steekproef — voordeel: kwantifiseerbare data teen lae koste.",
          "Fokusgroep: gefasiliteerde bespreking — voordeel: ryk kwalitatiewe insig.",
          "Waarneming: kyk hoe kliënte met produkte omgaan — voordeel: werklike gedrag sonder vooroordeel."
        ],
        solution: "Vraelys (kwantitatief + bekostigbaar), Fokusgroep (kwalitatiewe insig), Waarneming (gedragsegtheid).",
        commonErrors: [
          "Alle marknavorsing as vraelyste behandel.",
          "Nie die spesifieke voordeel verduidelik nie.",
          "Primêre en sekondêre navorsing verwar."
        ]
      },
      {
        question: "Verduidelik produklew ensiklus-fases en identifiseer 'n gepaste bemarkingstrategie vir elk.",
        steps: [
          "Inleiding: lae verkope — strategie: swaar bevordering.",
          "Groei: vinnig stygende verkope — strategie: uitbrei distribusie, differensieer.",
          "Rypheid: piekverkope — strategie: produkuitbreidings, lojaliteitsprogramme.",
          "Agteruitgang: dalende verkope — strategie: koste verminder of staak."
        ],
        solution: "PLS: Inleiding (bewusmaking), Groei (uitbrei + differensieer), Rypheid (uitbrei + behou), Agteruitgang (koste-bespaar of staak).",
        commonErrors: [
          "PLS as 'n vaste tydlyn behandel.",
          "Fases slegs beskryf sonder strategieë aan te beveel.",
          "PLS met die sakeliklus verwar."
        ]
      }
    ]
  },

  "BUS-6": {
    workedExamplesEn: [
      {
        question: "Explain the difference between fixed and variable costs, and calculate total cost: Fixed costs R50 000; Variable cost per unit R15; Output 3 000 units.",
        steps: [
          "Fixed costs: do not change with production level (e.g. rent, insurance).",
          "Variable costs: change proportionally with output (e.g. raw materials, wages per unit).",
          "Total Variable Cost = R15 × 3 000 = R45 000.",
          "Total Cost = Fixed + Variable = R50 000 + R45 000 = R95 000."
        ],
        solution: "Total Cost = R95 000.",
        commonErrors: [
          "Treating fixed costs as per-unit (they stay constant regardless of units produced).",
          "Confusing semi-variable costs (which have both fixed and variable components) with purely fixed costs.",
          "Not adding fixed and variable together to get total cost."
        ]
      },
      {
        question: "Calculate the break-even point: Fixed costs R80 000; Selling price R40/unit; Variable cost R24/unit.",
        steps: [
          "Contribution per unit = Selling price − Variable cost = R40 − R24 = R16.",
          "Break-even point (units) = Fixed costs / Contribution per unit = R80 000 / R16 = 5 000 units.",
          "Break-even revenue = 5 000 × R40 = R200 000."
        ],
        solution: "Break-even = 5 000 units / R200 000 revenue.",
        commonErrors: [
          "Dividing fixed costs by selling price instead of contribution — contribution is price minus variable cost.",
          "Confusing break-even units with break-even revenue (multiply units by price for revenue).",
          "Forgetting that break-even means zero profit (not zero revenue)."
        ]
      },
      {
        question: "Explain three ways in which entrepreneurship contributes to South Africa's economy.",
        steps: [
          "Job creation: new businesses hire employees, reducing unemployment.",
          "Innovation: entrepreneurs introduce new products, services and processes.",
          "GDP contribution: business activity generates tax revenue and economic output.",
          "Import substitution: local entrepreneurs replace imported goods, improving the trade balance."
        ],
        solution: "Entrepreneurship → job creation, innovation, GDP growth, and import substitution.",
        commonErrors: [
          "Describing entrepreneurship in general terms without linking to the SA economy specifically.",
          "Listing only job creation and missing innovation and GDP contributions.",
          "Not explaining how each contribution works mechanically."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die verskil tussen vaste en veranderlike koste, en bereken totale koste: Vaste koste R50 000; Veranderlike koste per eenheid R15; Uitset 3 000 eenhede.",
        steps: [
          "Vaste koste: verander nie met produksievlak nie.",
          "Veranderlike koste: verander eweredig met uitset.",
          "Totale Veranderlike Koste = R15 × 3 000 = R45 000.",
          "Totale Koste = R50 000 + R45 000 = R95 000."
        ],
        solution: "Totale Koste = R95 000.",
        commonErrors: [
          "Vaste koste as per-eenheid behandel.",
          "Semi-veranderlike koste met suiwer vaste koste verwar.",
          "Nie vaste en veranderlike saam tel nie."
        ]
      },
      {
        question: "Bereken die gelykbreekpunt: Vaste koste R80 000; Verkoopsprys R40/eenheid; Veranderlike koste R24/eenheid.",
        steps: [
          "Bydrae per eenheid = R40 − R24 = R16.",
          "Gelykbreekeenhede = R80 000 / R16 = 5 000 eenhede.",
          "Gelykbreekinkomste = 5 000 × R40 = R200 000."
        ],
        solution: "Gelykbreek = 5 000 eenhede / R200 000 inkomste.",
        commonErrors: [
          "Vaste koste deur verkoopsprys deel in plaas van bydrae.",
          "Gelykbreekinkomste met gelykbreekunhede verwar.",
          "Vergeet dat gelykbreek nul wins beteken."
        ]
      },
      {
        question: "Verduidelik drie maniere waarop entrepreneurskap by Suid-Afrika se ekonomie bydra.",
        steps: [
          "Werkskepping: nuwe besighede huur werknemers aan.",
          "Innovasie: entrepreneurs stel nuwe produkte in.",
          "BBP-bydrae: besigheidsaktiwiteit genereer belasting en ekonomiese uitset.",
          "Invoervervanging: plaaslike entrepreneurs vervang ingevoerde goedere."
        ],
        solution: "Entrepreneurskap → werkskepping, innovasie, BBP-groei, invoervervanging.",
        commonErrors: [
          "Entrepreneurskap in algemene terme beskryf sonder SA-ekonomie spesifiek.",
          "Slegs werkskepping lys sonder innovasie en BBP.",
          "Nie verduidelik hoe elke bydrae meganies werk nie."
        ]
      }
    ]
  },

  "BUS-7": {
    workedExamplesEn: [
      {
        question: "Explain the Labour Relations Act (LRA) provisions regarding unfair dismissal, and describe a fair dismissal procedure.",
        steps: [
          "The LRA states that every employee has the right not to be unfairly dismissed.",
          "Fair reasons for dismissal: misconduct, incapacity (poor performance or ill-health), operational requirements (retrenchment).",
          "Fair procedure: 1. Give the employee written notice of charges. 2. Hold a disciplinary hearing (employee may be represented). 3. Give the employee a chance to state their case. 4. Make a decision and communicate it in writing.",
          "Unfair dismissal: insufficient reason OR incorrect procedure (even with valid reason, bad procedure = unfair)."
        ],
        solution: "LRA fair dismissal: valid reason (misconduct/incapacity/retrenchment) + fair procedure (notice → hearing → decision). Failure on either = unfair dismissal.",
        commonErrors: [
          "Believing that a valid reason automatically makes a dismissal fair — procedure must also be correct.",
          "Not knowing that employees can take unfair dismissal cases to the CCMA.",
          "Confusing constructive dismissal (employer makes work impossible) with ordinary dismissal."
        ]
      },
      {
        question: "Explain what a human resources plan involves and why it is important for a growing business.",
        steps: [
          "HR plan: a structured forecast of an organisation's future staffing needs based on its strategic goals.",
          "Components: job analysis, job description, job specification, recruitment plan, training plan, succession plan.",
          "Why important for a growing business: avoids under- or over-staffing; ensures skills match future needs; reduces recruitment costs by planning ahead.",
          "Example: a retailer opening 10 new branches plans for 50 new employees — training must begin 3 months before opening."
        ],
        solution: "HR plan = staffing forecast aligned to strategy. Benefits: optimal staffing levels, skills readiness, cost efficiency.",
        commonErrors: [
          "Confusing HR planning with recruitment — planning is broader and includes training, succession and workforce analysis.",
          "Treating HR planning as reactive (responding to vacancies) rather than proactive (anticipating future needs).",
          "Not linking HR planning to business strategy."
        ]
      },
      {
        question: "Describe three forms of non-financial motivation based on Maslow's hierarchy of needs.",
        steps: [
          "Level 3 (Social needs): team events, social clubs, positive workplace relationships.",
          "Level 4 (Esteem needs): recognition programmes ('Employee of the Month'), titles, promotion.",
          "Level 5 (Self-actualisation): challenging assignments, opportunities for creative input, training for personal growth."
        ],
        solution: "Non-financial motivation: social connection (team events), esteem (recognition/titles), self-actualisation (growth/challenge).",
        commonErrors: [
          "Applying Maslow mechanically without explaining how each level motivates employees differently.",
          "Listing financial benefits (bonuses) as non-financial motivation.",
          "Treating Maslow as a fixed hierarchy that applies to all individuals equally — motivation is personal."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die LBW-bepalings oor onbillike ontslag en beskryf 'n billike ontslagprosedure.",
        steps: [
          "Die LBW stel dat elke werknemer die reg het om nie onbillik ontslaan te word nie.",
          "Billike redes: wangedrag, onbevoegdheid (swak prestasie of swak gesondheid), bedryfsvereistes (herstrukturering).",
          "Billike prosedure: 1. Skriftelike kennisgewing van aanklagte. 2. Dissiplinêre verhoor. 3. Geleentheid om te reageer. 4. Besluit skriftelik meedeel.",
          "Onbillike ontslag: onvoldoende rede OF onkorrekte prosedure."
        ],
        solution: "LBW-billike ontslag: geldige rede + billike prosedure. Faling op een van die twee = onbillike ontslag.",
        commonErrors: [
          "Glo 'n geldige rede maak ontslag outomaties billik — prosedure moet ook korrek wees.",
          "Nie weet werknemers kan onbillike ontslag-sake na die KVBA neem nie.",
          "Konstruktiewe ontslag met gewone ontslag verwar."
        ]
      },
      {
        question: "Verduidelik wat 'n menslike hulpbronplan behels en hoekom dit vir 'n groeiende besigheid belangrik is.",
        steps: [
          "MH-plan: 'n gestruktureerde vooruitskatting van toekomstige personeelbehoeftes.",
          "Komponente: werksanalise, pos beskrywing, posopgawe, werwingsplan, opleidingsplan, opvolgplan.",
          "Hoekom belangrik: vermy oor- of onderbemanning; verseker vaardighede stem ooreen met toekomstige behoeftes; verminder werwingskoste.",
          "Voorbeeld: 'n kleinhandelaar wat 10 nuwe takke open beplan 50 nuwe werknemers — opleiding begin 3 maande voor opening."
        ],
        solution: "MH-plan = personeelvooruitskatting in ooreenstemming met strategie. Voordele: optimale bemanning, vaardigheidgereedheid, koste-doeltreffendheid.",
        commonErrors: [
          "MH-beplanning met werwing verwar.",
          "MH-beplanning as reaktief behandel eerder as proaktief.",
          "MH-beplanning nie aan besigheidsstrategie koppel nie."
        ]
      },
      {
        question: "Beskryf drie vorme van nie-finansiële motivering op grond van Maslow se behoeftehiërargie.",
        steps: [
          "Vlak 3 (Sosiale behoeftes): spangebeurtenisse, sosiale klubs, positiewe werkplekverhoudings.",
          "Vlak 4 (Agting-behoeftes): erkenningsprogramme, titels, bevordering.",
          "Vlak 5 (Selfaktualisering): uitdagende opdragte, kreatiewe insette, opleiding vir persoonlike groei."
        ],
        solution: "Nie-finansiële motivering: sosiale verbinding, agting (erkenning/titels), selfaktualisering (groei/uitdaging).",
        commonErrors: [
          "Maslow meganies toepas sonder te verduidelik hoe elke vlak werknemers verskillend motiveer.",
          "Finansiële voordele as nie-finansiële motivering lys.",
          "Maslow as 'n vaste hiërargie behandel wat op alle individue gelyk van toepassing is."
        ]
      }
    ]
  },

  "BUS-8": {
    workedExamplesEn: [
      {
        question: "Explain broad-based black economic empowerment (B-BBEE) and describe three of its pillars.",
        steps: [
          "B-BBEE: a South African policy designed to redress economic inequalities by broadening participation of black South Africans in the economy.",
          "Pillar 1 — Ownership: percentage of company equity owned by black shareholders.",
          "Pillar 2 — Management control: representation of black people in senior management and board positions.",
          "Pillar 3 — Skills development: investment in training and upskilling black employees.",
          "Others include enterprise and supplier development, and socio-economic development."
        ],
        solution: "B-BBEE pillars: Ownership (equity), Management control (representation), Skills development (training), plus supplier/socio-economic development.",
        commonErrors: [
          "Confusing B-BBEE with BEE (BEE was the earlier, narrower policy; B-BBEE is the current, broader framework).",
          "Treating B-BBEE as applying only to ownership — it covers five pillars.",
          "Not explaining how non-compliance affects businesses (lower B-BBEE scores affect tender eligibility)."
        ]
      },
      {
        question: "Explain the Consumer Protection Act (CPA) and describe three rights it gives South African consumers.",
        steps: [
          "CPA: enacted in 2009, the CPA protects South African consumers from unfair business practices.",
          "Right 1 — Right to equality: no discrimination in access to goods and services.",
          "Right 2 — Right to privacy: protection from unwanted direct marketing.",
          "Right 3 — Right to return defective goods: within 6 months of purchase, defective goods must be repaired, replaced or refunded."
        ],
        solution: "CPA rights: equality (non-discrimination), privacy (no unwanted marketing), return/repair/replace defective goods (6-month window).",
        commonErrors: [
          "Confusing the CPA with contract law — the CPA applies even without a written contract.",
          "Not knowing the 6-month period for returns — a common exam-specific detail.",
          "Treating the CPA as applying only to products (it covers services too)."
        ]
      },
      {
        question: "Describe the impact of the National Credit Act (NCA) on both consumers and credit providers.",
        steps: [
          "NCA (2005): regulates the credit industry to prevent reckless lending and over-indebtedness.",
          "Impact on consumers: right to accurate credit information; right to apply for debt review; protection from reckless credit.",
          "Impact on credit providers: must assess affordability before granting credit; must disclose all costs (fees, interest) upfront; cannot use abusive collection practices.",
          "Practical example: a bank cannot extend a R50 000 loan to someone whose income cannot service the repayment — NCA requires affordability assessment."
        ],
        solution: "NCA protects consumers from reckless lending; obligates credit providers to conduct affordability assessments and disclose all costs.",
        commonErrors: [
          "Confusing the NCA with the CPA — NCA governs credit specifically; CPA governs general consumer transactions.",
          "Not explaining debt review (ukuqhelelana) as a key consumer protection mechanism.",
          "Treating the NCA as purely restricting consumers rather than protecting them."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik Breëbasis Swart Ekonomiese Bemagtiging (B-SEB) en beskryf drie pilare.",
        steps: [
          "B-SEB: SA-beleid om ekonomiese ongelykhede reg te stel.",
          "Pilaar 1 — Eienaarskap: persentasie maatskappyaandele deur swart aandeelhouers.",
          "Pilaar 2 — Bestuursbeheeer: verteenwoordiging in senior bestuur.",
          "Pilaar 3 — Vaardigheidsontwikkeling: belegging in opleiding van swart werknemers."
        ],
        solution: "B-SEB-pilare: Eienaarskap, Bestuursbeheer, Vaardigheidsontwikkeling.",
        commonErrors: [
          "B-SEB met SEB verwar.",
          "B-SEB as slegs op eienaarskap van toepassing behandel.",
          "Nie verduidelik hoe nie-nakoming besighede beïnvloed nie."
        ]
      },
      {
        question: "Verduidelik die Wet op Verbruikersbeskerming (WVB) en beskryf drie regte.",
        steps: [
          "WVB (2009): beskerm SA-verbruikers teen onbillike besigheidspraktyke.",
          "Reg 1 — Reg op gelykheid: geen diskriminasie in toegang tot goedere nie.",
          "Reg 2 — Reg op privaatheid: beskerming teen ongewenste direkte bemarking.",
          "Reg 3 — Reg om gebrekkige goedere terug te stuur: binne 6 maande na aankoop."
        ],
        solution: "WVB-regte: gelykheid, privaatheid, terugstuur/herstel/vervang gebrekkige goedere (6-maand-venster).",
        commonErrors: [
          "WVB met kontrakrng verwar.",
          "Nie die 6-maand-periode vir terugkeer weet nie.",
          "WVB as slegs op produkte van toepassing behandel."
        ]
      },
      {
        question: "Beskryf die impak van die Nasionale Kredietwet (NKW) op verbruikers en krediteure.",
        steps: [
          "NKW (2005): reguleer die kredietbedryf om roekelose lening en oorverskuldigheid te voorkom.",
          "Impak op verbruikers: reg op akkurate kredietinligting; reg om vir skuldhersiening aansoek te doen.",
          "Impak op krediteure: moet bekostigbaarheid assesseer voor kredietverlening; alle koste vooraf openbaar.",
          "Praktiese voorbeeld: 'n bank kan nie 'n R50 000 lening uitbrei aan iemand wie se inkomste die terugbetaling nie kan diens nie."
        ],
        solution: "NKW beskerm verbruikers teen roekelose lening; verplig krediteure tot bekostigbaarheidsassessering en openbaarmaking.",
        commonErrors: [
          "NKW met WVB verwar.",
          "Skuldhersiening nie as 'n sleutel verbruikersbeskermingsmeganisme verduidelik nie.",
          "NKW as suiwer beperkend vir verbruikers behandel eerder as beskermend."
        ]
      }
    ]
  },

  // ===================== ECONOMICS (ECO) =====================

  "ECO-1": {
    workedExamplesEn: [
      {
        question: "Calculate the money multiplier if the reserve requirement is 10%, and explain its effect on the money supply.",
        steps: [
          "Money multiplier = 1 / reserve ratio = 1 / 0.10 = 10.",
          "If the central bank injects R100 million into the banking system, maximum new money = R100m × 10 = R1 000 million.",
          "Explanation: each bank lends 90% of deposits, which becomes deposits in other banks, which lend 90% again — this chain multiplies the initial injection."
        ],
        solution: "Money multiplier = 10; R100m injection creates up to R1 000m in new money supply.",
        commonErrors: [
          "Dividing the reserve ratio by 1 (getting 0.1) instead of dividing 1 by the ratio (getting 10).",
          "Assuming the full multiplier effect always occurs — in practice, leakages (cash holding, foreign payments) reduce it.",
          "Confusing the money multiplier with the Keynesian spending multiplier (k = 1/(1−MPC))."
        ]
      },
      {
        question: "Explain the difference between expansionary and contractionary fiscal policy, with one tool for each.",
        steps: [
          "Expansionary: government increases spending or cuts taxes to stimulate demand — used during recession.",
          "Tool: increase in government infrastructure spending (roads, schools, hospitals).",
          "Contractionary: government decreases spending or raises taxes to slow inflation — used during overheating.",
          "Tool: increase in VAT rate or income tax rates.",
          "Note: fiscal policy has a time lag — effects take months or years to materialise."
        ],
        solution: "Expansionary (recession): raise spending/cut taxes. Contractionary (inflation): cut spending/raise taxes. Both have time lags.",
        commonErrors: [
          "Confusing fiscal policy (government budget) with monetary policy (central bank interest rates).",
          "Not naming a specific tool for each policy direction.",
          "Ignoring the time lag issue, which makes fiscal policy less flexible than monetary policy."
        ]
      },
      {
        question: "Calculate the spending multiplier: MPC = 0.8. If government spending increases by R200 million, by how much does GDP change?",
        steps: [
          "Multiplier k = 1 / (1 − MPC) = 1 / (1 − 0.8) = 1 / 0.2 = 5.",
          "Change in GDP = multiplier × change in spending = 5 × R200m = R1 000 million.",
          "Explanation: the R200m is spent, creating income, which is spent again (80% each round), creating a ripple effect."
        ],
        solution: "k = 5; GDP increases by R1 000 million (R1 billion).",
        commonErrors: [
          "Using MPC (0.8) as the multiplier instead of calculating 1/(1−MPC).",
          "Using MPS (1 − MPC = 0.2) incorrectly — MPS is used in the denominator, not as the multiplier itself.",
          "Confusing MPC (marginal propensity to consume) with average propensity to consume (APC)."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Bereken die geldvermenigvuldiger as die reserwevereiste 10% is en verduidelik die effek op die geldvoorraad.",
        steps: [
          "Geldvermenigvuldiger = 1 / reserweverhouding = 1 / 0.10 = 10.",
          "As die sentrale bank R100 miljoen inspuit: maksimum nuwe geld = R100m × 10 = R1 000 miljoen.",
          "Verduideliking: elke bank leen 90% van deposito's, wat deposito's in ander banke word."
        ],
        solution: "Geldvermenigvuldiger = 10; R100m inspuiting skep tot R1 000m in nuwe geldvoorraad.",
        commonErrors: [
          "Die reserweverhouding deur 1 deel (0.1 kry) in plaas van 1 deur die verhouding deel (10 kry).",
          "Aanvaar die volle vermenigvuldigereffek vind altyd plaas.",
          "Geldvermenigvuldiger met Keynesiaanse bestedingsvermenigvuldiger verwar."
        ]
      },
      {
        question: "Verduidelik die verskil tussen ekspansionêre en kontraksiefiskale beleid, met een instrument vir elk.",
        steps: [
          "Ekspansionêr: regering verhoog besteding of verlaag belasting — gebruik tydens resessie.",
          "Instrument: verhoging in staatsinfrastruktuurbesteding.",
          "Kontraksief: regering verminder besteding of verhoog belasting — gebruik tydens oorstyging.",
          "Instrument: verhoging in BTW of inkomstebelasting.",
          "Let op: fiskale beleid het 'n tydvertraging."
        ],
        solution: "Ekspansionêr (resessie): verhoog besteding/verlaag belasting. Kontraksief (inflasie): verminder besteding/verhoog belasting.",
        commonErrors: [
          "Fiskale beleid (staatsbegroting) met monetêre beleid (sentrale bank rentekoerse) verwar.",
          "Nie 'n spesifieke instrument vir elke beleidsrigting noem nie.",
          "Die tydvertraagprobleem ignoreer."
        ]
      },
      {
        question: "Bereken die bestedingsvermenigvuldiger: MGV = 0.8. As staatsbesteding met R200 miljoen toeneem, hoeveel verander BBP?",
        steps: [
          "Vermenigvuldiger k = 1 / (1 − MGV) = 1 / 0.2 = 5.",
          "Verandering in BBP = 5 × R200m = R1 000 miljoen.",
          "Verduideliking: die R200m word bestee, skep inkomste, word weer bestee (80% elke ronde)."
        ],
        solution: "k = 5; BBP verhoog met R1 000 miljoen.",
        commonErrors: [
          "MGV (0.8) as die vermenigvuldiger gebruik in plaas van 1/(1-MGV).",
          "MGS (1 − MGV = 0.2) as die vermenigvuldiger gebruik.",
          "MGV met gemiddelde verbruiksgeneigdheid verwar."
        ]
      }
    ]
  },

  "ECO-2": {
    workedExamplesEn: [
      {
        question: "Calculate PED: Price rises from R50 to R60; Quantity demanded falls from 200 to 160 units. Interpret the result.",
        steps: [
          "% change in Qd = (160−200)/200 × 100 = −40/200 × 100 = −20%.",
          "% change in P = (60−50)/50 × 100 = 10/50 × 100 = +20%.",
          "PED = %ΔQd / %ΔP = −20% / +20% = −1.0.",
          "Interpretation: |PED| = 1.0 → unitary elastic. A 1% price rise leads to exactly 1% fall in Qd."
        ],
        solution: "PED = −1.0 (unitary elastic) — proportionate response of quantity to price.",
        commonErrors: [
          "Using the wrong base (new price instead of original price) in the percentage calculation.",
          "Ignoring the negative sign — PED for normal goods is always negative (inverse price-quantity relationship).",
          "Confusing PED values: |PED| > 1 = elastic; |PED| < 1 = inelastic; |PED| = 1 = unitary."
        ]
      },
      {
        question: "Explain a positive and negative externality with one example of each, and state the appropriate government intervention.",
        steps: [
          "Positive externality: benefits spill over to third parties not involved in the transaction.",
          "Example: education — a more educated workforce benefits the whole economy, not just the individual.",
          "Government response: subsidise education to encourage greater consumption than the private market provides.",
          "Negative externality: costs are imposed on third parties.",
          "Example: factory pollution — factory profits but the community suffers health costs.",
          "Government response: tax the factory (Pigouvian tax) or introduce production limits."
        ],
        solution: "Positive (education) → subsidise. Negative (pollution) → tax or regulate.",
        commonErrors: [
          "Confusing externalities with public goods — externalities have side-effects from private market activity; public goods are non-excludable.",
          "Not specifying the government intervention — the question always asks 'how should government respond?'",
          "Identifying only negative externalities (pollution) and ignoring positive ones."
        ]
      },
      {
        question: "Draw a supply and demand diagram showing the effect of a government price ceiling set below the equilibrium price.",
        steps: [
          "Draw axes: Price (Y), Quantity (X). Draw downward demand curve, upward supply curve. Mark equilibrium P* and Q*.",
          "Draw a horizontal line BELOW P* — this is the price ceiling (maximum legal price).",
          "At the ceiling price: Qd > Qs (shortage) — demand exceeds supply.",
          "Label the shortage as the horizontal distance between Qs and Qd at the ceiling price."
        ],
        solution: "Price ceiling below equilibrium → shortage (Qd > Qs). Example: rent control creates housing shortages.",
        commonErrors: [
          "Drawing the price ceiling ABOVE equilibrium (that is a price floor, not a ceiling).",
          "Not labelling the shortage gap on the diagram.",
          "Confusing price ceiling (maximum) with price floor (minimum)."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Bereken PEV: Prys styg van R50 na R60; Hoeveelheid gevra daal van 200 na 160. Interpreteer die resultaat.",
        steps: [
          "% verandering in Hv = (160−200)/200 × 100 = −20%.",
          "% verandering in P = (60−50)/50 × 100 = +20%.",
          "PEV = −20% / +20% = −1.0.",
          "Interpretasie: |PEV| = 1.0 → eenheidselasties."
        ],
        solution: "PEV = −1.0 (eenheidselasties) — proporsionele reaksie van hoeveelheid op prys.",
        commonErrors: [
          "Die verkeerde basis gebruik (nuwe prys in plaas van oorspronklike) in persentasieberekening.",
          "Die negatiewe teken ignoreer.",
          "PEV-waardes verwar: |PEV| > 1 = elasties; < 1 = onelasties; = 1 = eenheidselasties."
        ]
      },
      {
        question: "Verduidelik 'n positiewe en negatiewe eksternaliteit met een voorbeeld van elk, en stel gepaste staatsintervensie.",
        steps: [
          "Positiewe eksternaliteit: voordele vloei na derde partye oor.",
          "Voorbeeld: opvoeding — 'n meer opgevoede arbeidsmag bevoordeel die hele ekonomie.",
          "Staatsreaksie: subsidieer opvoeding om groter verbruik as die private mark bied, aan te moedig.",
          "Negatiewe eksternaliteit: koste word op derde partye opgelê.",
          "Voorbeeld: fabrieksbesoedeling — fabriek profiteer maar gemeenskap dra gesondheidskoste.",
          "Staatsreaksie: belas die fabriek of stel produksielimiete."
        ],
        solution: "Positief (opvoeding) → subsidieer. Negatief (besoedeling) → belas of reguleer.",
        commonErrors: [
          "Eksternaliteite met openbare goedere verwar.",
          "Nie die staatsintervensie spesifiseer nie.",
          "Slegs negatiewe eksternaliteite identifiseer."
        ]
      },
      {
        question: "Teken 'n vraag-en-aanbod-diagram wat die effek toon van 'n staatsprysplafon gestel onder die ewewigsprys.",
        steps: [
          "Teken asse: Prys (Y), Hoeveelheid (X). Teken vraag- en aanbodkurwes. Merk ewewig P* en H*.",
          "Teken 'n horisontale lyn ONDER P* — dit is die prysplafon.",
          "By plafon: Hv > Ha (tekort).",
          "Merk die tekort as die horisontale afstand tussen Ha en Hv."
        ],
        solution: "Prysplafon onder ewewig → tekort (Hv > Ha). Voorbeeld: huurkontrole skep behuisingstekort.",
        commonErrors: [
          "Prysplafon BO ewewig teken (dit is 'n prysplank, nie plafon).",
          "Die tekortgaping nie op die diagram aandui nie.",
          "Prysplafon (maksimum) met prysplank (minimum) verwar."
        ]
      }
    ]
  },

  "ECO-3": {
    workedExamplesEn: [
      {
        question: "Outline the key difference between the RDP and GEAR policies in post-apartheid South Africa.",
        steps: [
          "RDP (Reconstruction and Development Programme, 1994): focused on meeting basic needs — housing, healthcare, education, clean water. Led by ANC government.",
          "Approach: state-led delivery funded by government budget.",
          "GEAR (Growth, Employment and Redistribution, 1996): shifted focus to macroeconomic stability — lower inflation, reduce budget deficit, attract foreign investment.",
          "Approach: market-oriented; influenced by IMF/World Bank thinking. Reduced state spending.",
          "Criticism of GEAR: prioritised economic orthodoxy over social needs; unemployment rose."
        ],
        solution: "RDP = needs-driven, state-led social delivery. GEAR = market-driven macroeconomic stability. GEAR replaced RDP amid criticism that social delivery stalled.",
        commonErrors: [
          "Treating RDP and GEAR as sequential without explaining why GEAR replaced the RDP.",
          "Not knowing the dates: RDP 1994, GEAR 1996.",
          "Ignoring criticism of GEAR — exam questions frequently ask for both positives and negatives."
        ]
      },
      {
        question: "Explain two components of the B-BBEE Codes of Good Practice and their intended economic impact.",
        steps: [
          "Component 1 — Enterprise and Supplier Development: companies must procure from black-owned businesses.",
          "Economic impact: stimulates black business growth; creates supply chain linkages.",
          "Component 2 — Socio-Economic Development: companies invest in non-profit or community initiatives (e.g. bursaries, skills training).",
          "Economic impact: raises human capital in disadvantaged communities; reduces inequality."
        ],
        solution: "ESD → black enterprise growth. SED → community human capital. Both reduce structural inequality over time.",
        commonErrors: [
          "Confusing Enterprise Development (supporting black businesses) with Socio-Economic Development (community investment).",
          "Not explaining the economic impact — stating what the component is without showing what it achieves.",
          "Treating B-BBEE as a quota system rather than a scorecard — it uses weighted scores across five pillars."
        ]
      },
      {
        question: "Describe the 'triple challenge' facing South Africa and explain one government policy addressing each dimension.",
        steps: [
          "Poverty: government policy — Social Relief of Distress (SRD) grant; National School Nutrition Programme.",
          "Inequality: government policy — progressive taxation (higher earners pay more); BEE/B-BBEE equity redistribution.",
          "Unemployment: government policy — Expanded Public Works Programme (EPWP) creates temporary jobs; National Youth Development Agency provides skills training."
        ],
        solution: "Triple challenge: poverty (SRD/nutrition), inequality (progressive tax/BEE), unemployment (EPWP/NYDA).",
        commonErrors: [
          "Listing the three challenges without pairing each with a specific policy.",
          "Confusing EPWP (public works jobs) with NSFAS (student funding) — different challenges, different policies.",
          "Not knowing acronyms: SRD, EPWP, NYDA are frequently tested."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Omlyn die sleutelverskil tussen die HOP en GEAR-beleide in post-apartheid Suid-Afrika.",
        steps: [
          "HOP (1994): gefokus op basiese behoeftes — behuising, gesondheidsorg, opvoeding. Staatsgeleid.",
          "GEAR (1996): geskuif na makro-ekonomiese stabiliteit — laer inflasie, begrotingstekort verminder.",
          "Benadering: markgeoriënteerd. Verminderde staatsbesteding.",
          "Kritiek op GEAR: prioritiseerde ekonomiese ortodoksie oor sosiale behoeftes."
        ],
        solution: "HOP = behoeftegedrewe, staatsgelei. GEAR = markgedrewe makro-ekonomiese stabiliteit.",
        commonErrors: [
          "HOP en GEAR as opeenvolgend behandel sonder te verduidelik hoekom GEAR HOP vervang het.",
          "Die datums nie ken nie: HOP 1994, GEAR 1996.",
          "Kritiek op GEAR ignoreer."
        ]
      },
      {
        question: "Verduidelik twee komponente van die B-SEB Kodes van Goeie Praktyk en hul beoogde ekonomiese impak.",
        steps: [
          "Komponent 1 — Ondernemings- en Verskaffersontwikkeling: maatskappye moet by swart-eiendomsondernemings aankoop.",
          "Ekonomiese impak: stimuleer swart ondernemingsgroei; skep voorsieningskettingskakels.",
          "Komponent 2 — Sosio-Ekonomiese Ontwikkeling: belegging in nie-winsgewende of gemeenskapsinisiatiewe.",
          "Ekonomiese impak: verhoog menslike kapitaal; verminder ongelykheid."
        ],
        solution: "OVO → swart ondernemingsgroei. SEO → gemeenskapsmenslike kapitaal. Beide verminder strukturele ongelykheid.",
        commonErrors: [
          "Ondernemingsontwikkeling met Sosio-Ekonomiese Ontwikkeling verwar.",
          "Nie die ekonomiese impak verduidelik nie.",
          "B-SEB as 'n kwotas-stelsel behandel eerder as 'n puntekaart."
        ]
      },
      {
        question: "Beskryf die 'drievoudige uitdaging' wat Suid-Afrika in die gesig staar en verduidelik een staatsbeleid vir elke dimensie.",
        steps: [
          "Armoede: Maatskaplike Noodverligting (MNV) toelaes; Nasionale Skoolvoedingsprogram.",
          "Ongelykheid: progressiewe belasting; SEB/B-SEB ekwiteitsherverspreiding.",
          "Werkloosheid: Uitgebreide Openbare Werksprogram (UOWP); Nasionale Jeugontwikkelingsagentskap."
        ],
        solution: "Drievoudige uitdaging: armoede (MNV/voeding), ongelykheid (progressiewe belasting/SEB), werkloosheid (UOWP/NJOA).",
        commonErrors: [
          "Die drie uitdagings lys sonder om elke een aan 'n spesifieke beleid te koppel.",
          "UOWP (openbare werksposte) met NSFAS (studente-befondsing) verwar.",
          "Afkortings nie ken nie: MNV, UOWP, NJOA."
        ]
      }
    ]
  },

  "ECO-4": {
    workedExamplesEn: [
      {
        question: "Explain the demand-pull and cost-push causes of inflation with one example of each in the South African context.",
        steps: [
          "Demand-pull: inflation caused by excess demand (too much money chasing too few goods).",
          "SA example: government wage increases for public servants → more spending → prices rise.",
          "Cost-push: inflation caused by rising production costs passed on to consumers.",
          "SA example: rising fuel prices (petrol levies, rand weakness) increase transport costs → prices of food and goods rise.",
          "SA CPI target: 3–6% (SARB mandate)."
        ],
        solution: "Demand-pull (excess demand): government wage bill. Cost-push (rising costs): fuel price increases. Both push CPI upward.",
        commonErrors: [
          "Confusing CPI (measures inflation) with PPI (measures producer price changes, a leading indicator of CPI).",
          "Not providing SA-specific examples — generic examples score less.",
          "Ignoring that SARB targets 3–6% CPI — this is a frequently asked fact."
        ]
      },
      {
        question: "Distinguish between cyclical, structural, and frictional unemployment, with one cause and one solution for each.",
        steps: [
          "Cyclical: caused by economic recession (falling GDP); solution: expansionary fiscal/monetary policy.",
          "Structural: caused by mismatch between worker skills and available jobs (e.g. tech replacing manual labour); solution: retraining and skills development.",
          "Frictional: temporary unemployment as workers move between jobs; solution: improve job market information, recruitment agencies."
        ],
        solution: "Cyclical (recession) → stimulus. Structural (skills mismatch) → training. Frictional (between jobs) → better job information.",
        commonErrors: [
          "Treating structural unemployment as solvable by stimulus spending — stimulus addresses cyclical, not structural, unemployment.",
          "Confusing frictional (voluntary/temporary) with cyclical (involuntary/recession-driven).",
          "Not offering a specific solution for each type."
        ]
      },
      {
        question: "Explain why load-shedding (Eskom's power cuts) is both an environmental and economic issue in South Africa.",
        steps: [
          "Economic impact 1: businesses cannot operate → reduced output → GDP falls.",
          "Economic impact 2: increased costs from generators and alternative energy sources → inflationary pressure.",
          "Economic impact 3: foreign investors deterred by unreliable electricity → FDI falls.",
          "Environmental angle: Eskom burns coal → high carbon emissions → SA faces carbon tax; renewables investment delayed by infrastructure uncertainty."
        ],
        solution: "Load-shedding: economic (GDP loss, inflation, FDI deterrence) + environmental (coal emissions, carbon tax burden, renewable transition delays).",
        commonErrors: [
          "Discussing only the economic impact without the environmental dimension.",
          "Not linking Eskom's coal use to SA's carbon tax obligations.",
          "Treating load-shedding as temporary rather than a structural infrastructure crisis."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik vraag-trek en koste-stoot oorsake van inflasie met een SA-voorbeeld van elk.",
        steps: [
          "Vraag-trek: inflasie veroorsaak deur oormaat vraag.",
          "SA-voorbeeld: staatsbeampte-loonverhogings → meer besteding → pryse styg.",
          "Koste-stoot: inflasie veroorsaak deur stygende produksiekoste.",
          "SA-voorbeeld: stygende brandstofpryse verhoog vervoerkoste → voedsel- en goederepryse styg.",
          "SA-IPV-teiken: 3–6% (SARB-mandaat)."
        ],
        solution: "Vraag-trek (oormaat vraag): staatsloonstaat. Koste-stoot (stygende koste): brandstofprysstyging.",
        commonErrors: [
          "IPV (meet inflasie) met PPV (produsente se prysveranderinge) verwar.",
          "Nie SA-spesifieke voorbeelde gee nie.",
          "Ignoreer dat SARB 3–6% IPV teiken."
        ]
      },
      {
        question: "Onderskei tussen sikliese, strukturele en friksionele werkloosheid, met een oorsaak en een oplossing vir elk.",
        steps: [
          "Sikliese: veroorsaak deur resessie; oplossing: ekspansionêre beleid.",
          "Strukturele: vaardigheidsmismatch; oplossing: heropleding.",
          "Friksionele: tydelik terwyl werkers bane verander; oplossing: beter arbeidsmarkinligting."
        ],
        solution: "Sikliese (resessie) → stimulering. Strukturele (vaardigheids-mismatch) → opleiding. Friksionele (tussen bane) → beter inligting.",
        commonErrors: [
          "Strukturele werkloosheid deur stimuleringsbesteding probeer oplos.",
          "Friksionele (vrywillig/tydelik) met sikliese (onvrywillig/resessie) verwar.",
          "Nie 'n spesifieke oplossing vir elke tipe bied nie."
        ]
      },
      {
        question: "Verduidelik hoekom beurtkrag (Eskom se kragonderbrekings) beide 'n omgewings- en ekonomiese kwessie in SA is.",
        steps: [
          "Ekonomiese impak 1: besighede kan nie bedryf nie → verminderde uitset → BBP daal.",
          "Ekonomiese impak 2: verhoogde koste van generators → inflasionêre druk.",
          "Ekonomiese impak 3: buitelandse beleggers word afskrik → BDI daal.",
          "Omgewingshoek: Eskom verbrand steenkool → hoë koolstofemissies → SA staar koolstofbelasting."
        ],
        solution: "Beurtkrag: ekonomies (BBP-verlies, inflasie, BDI-afwending) + omgewings (steenkoolemissies, koolstofbelasting).",
        commonErrors: [
          "Slegs die ekonomiese impak bespreek sonder die omgewingsdimensie.",
          "Eskom se steenkoolgebruik nie aan SA se koolstofbelastingverpligtings koppel nie.",
          "Beurtkrag as tydelik behandel eerder as 'n strukturele infrastruktuurkrisis."
        ]
      }
    ]
  },

  "ECO-5": {
    workedExamplesEn: [
      {
        question: "Explain the difference between economic growth (GDP) and economic development (HDI), with SA examples.",
        steps: [
          "Economic growth: increase in a country's output of goods and services, measured by GDP or GNI.",
          "SA example: a mining boom increases GDP without necessarily improving literacy or life expectancy.",
          "Economic development: improvement in quality of life, human capability and well-being, measured by HDI.",
          "HDI components: life expectancy (health) + education + GNI per capita (standard of living).",
          "Key point: growth can occur without development (e.g. oil states with high GDP but low HDI)."
        ],
        solution: "Growth = GDP (output). Development = HDI (life quality: health + education + income). Growth is a means to development, not an end.",
        commonErrors: [
          "Treating growth and development as synonymous — they measure different things.",
          "Not knowing HDI components — life expectancy, education index, and GNI per capita.",
          "Failing to give a country-specific example."
        ]
      },
      {
        question: "Distinguish between demand-side and supply-side policies for promoting economic growth.",
        steps: [
          "Demand-side: stimulate aggregate demand — tool: lower interest rates; increase government spending; tax cuts.",
          "Works through: increasing consumer spending and investment.",
          "Supply-side: increase productive capacity — tool: deregulation; investment in infrastructure; education and skills.",
          "Works through: lowering costs, improving efficiency, enabling more to be produced at each price level.",
          "SA context: EPWP (demand-side short-term jobs) vs infrastructure investment (supply-side long-term)."
        ],
        solution: "Demand-side (stimulate spending) vs supply-side (expand capacity). Both needed for sustained growth.",
        commonErrors: [
          "Treating supply-side policies as short-term solutions — they take years to affect productive capacity.",
          "Classifying all government spending as demand-side — infrastructure investment is supply-side.",
          "Not linking each policy type to its mechanism (how it actually grows the economy)."
        ]
      },
      {
        question: "Explain what is meant by 'real GDP' and calculate it: Nominal GDP = R800 billion; GDP deflator = 125.",
        steps: [
          "Nominal GDP: GDP measured in current prices (includes inflation effects).",
          "Real GDP: GDP adjusted for inflation — measures actual output change.",
          "Formula: Real GDP = (Nominal GDP / GDP Deflator) × 100.",
          "Calculation: Real GDP = (R800 billion / 125) × 100 = R640 billion."
        ],
        solution: "Real GDP = R640 billion. Difference from nominal (R800bn) reflects inflation: the economy only grew by R640bn in real terms.",
        commonErrors: [
          "Multiplying by the deflator instead of dividing — this gives a larger, incorrect result.",
          "Not multiplying by 100 after dividing.",
          "Confusing the GDP deflator with the CPI — both measure inflation but the deflator is economy-wide."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die verskil tussen ekonomiese groei (BBP) en ekonomiese ontwikkeling (MOI), met SA-voorbeelde.",
        steps: [
          "Ekonomiese groei: toename in uitset, gemeet deur BBP of BNI.",
          "SA-voorbeeld: 'n mynboombeurs verhoog BBP sonder noodwendig geletterdheid of lewensverwagting te verbeter.",
          "Ekonomiese ontwikkeling: verbetering in lewenskwaliteit, gemeet deur MOI.",
          "MOI-komponente: lewensverwagting + opvoeding + BNI per capita.",
          "Sleutelpunt: groei kan plaasvind sonder ontwikkeling."
        ],
        solution: "Groei = BBP (uitset). Ontwikkeling = MOI (lewenskwaliteit). Groei is 'n middel tot ontwikkeling, nie 'n einde.",
        commonErrors: [
          "Groei en ontwikkeling as sinoniem behandel.",
          "MOI-komponente nie ken nie.",
          "Versuim om 'n landspesifieke voorbeeld te gee."
        ]
      },
      {
        question: "Onderskei tussen vraag-kant en aanbod-kant beleide vir ekonomiese groei.",
        steps: [
          "Vraag-kant: stimuleer geaggregeerde vraag — rentekoers verlaag; staatsbesteding verhoog.",
          "Werk deur: verbruikersbesteding en belegging verhoog.",
          "Aanbod-kant: produktiewe kapasiteit verhoog — deregulering; infrastruktuur; opvoeding.",
          "Werk deur: koste verlaag, doeltreffendheid verbeter.",
          "SA-konteks: UOWP (vraag-kant kort-termyn) vs infrastruktuurbelegging (aanbod-kant lang-termyn)."
        ],
        solution: "Vraag-kant (besteding stimuleer) vs aanbod-kant (kapasiteit uitbrei). Beide nodig vir volgehoue groei.",
        commonErrors: [
          "Aanbod-kant beleide as kort-termyn oplossings behandel.",
          "Alle staatsbesteding as vraag-kant klassifiseer.",
          "Nie die meganisme koppel van hoe elke beleidstype die ekonomie laat groei nie."
        ]
      },
      {
        question: "Verduidelik 'reële BBP' en bereken dit: Nominale BBP = R800 miljard; BBP-deflator = 125.",
        steps: [
          "Nominale BBP: BBP gemeet in huidige pryse (insluitend inflasie-effekte).",
          "Reële BBP: BBP aangepas vir inflasie.",
          "Formule: Reële BBP = (Nominale BBP / BBP-deflator) × 100.",
          "Berekening: Reële BBP = (R800 / 125) × 100 = R640 miljard."
        ],
        solution: "Reële BBP = R640 miljard.",
        commonErrors: [
          "Met die deflator vermenigvuldig in plaas van deel.",
          "Nie met 100 vermenigvuldig na deling nie.",
          "BBP-deflator met IPV verwar."
        ]
      }
    ]
  },

  "ECO-6": {
    workedExamplesEn: [
      {
        question: "Explain what a Special Economic Zone (SEZ) is and describe two economic benefits for South Africa.",
        steps: [
          "SEZ definition: a designated geographic area with special economic regulations — typically lower taxes, simplified customs, and dedicated infrastructure — to attract investment.",
          "SA example: Coega IDZ (Industrial Development Zone) in the Eastern Cape.",
          "Benefit 1: Foreign direct investment — companies are attracted by tax incentives and infrastructure, bringing capital into SA.",
          "Benefit 2: Job creation and skills transfer — manufacturing in SEZs creates employment and upskills workers through technology transfer."
        ],
        solution: "SEZ = special-regulation investment zone. Benefits: FDI attraction, job creation and skills transfer.",
        commonErrors: [
          "Confusing SEZs with IDZs — Industrial Development Zones are a specific type of SEZ in SA.",
          "Not naming a SA-specific SEZ (Coega, East London, Richards Bay are frequently tested examples).",
          "Describing benefits without explaining the mechanism (how the incentive leads to the benefit)."
        ]
      },
      {
        question: "Explain what beneficiation means in the SA context and why it is important for economic development.",
        steps: [
          "Beneficiation: processing raw materials into higher-value products before exporting.",
          "SA context: instead of exporting raw platinum ore, process it into catalytic converters (auto industry) or hydrogen fuel cells.",
          "Economic importance 1: creates higher-value exports, improving terms of trade.",
          "Economic importance 2: creates more jobs (processing requires more labour than raw extraction).",
          "Economic importance 3: develops advanced industrial skills and technology."
        ],
        solution: "Beneficiation = add value before export. Benefits: better export prices, more jobs, advanced skills.",
        commonErrors: [
          "Confusing beneficiation with mining extraction — beneficiation is the value-adding step after extraction.",
          "Not linking beneficiation to specific SA resources (platinum, gold, iron ore, coal).",
          "Treating beneficiation as purely economic without mentioning skills development."
        ]
      },
      {
        question: "Describe the Industrial Policy Action Plan (IPAP) and identify two priority sectors it targets.",
        steps: [
          "IPAP: South Africa's government industrial policy framework, aimed at growing labour-absorbing manufacturing industries.",
          "Purpose: reduce dependence on commodity exports; develop value-adding industries.",
          "Priority sector 1: Agro-processing — processing agricultural products (e.g. fruit, meat) for export.",
          "Priority sector 2: Renewable energy — solar and wind manufacturing to support SA's energy transition.",
          "Additional sectors: automotive, clothing/textiles, business process services."
        ],
        solution: "IPAP targets labour-absorbing manufacturing. Priority sectors: agro-processing and renewable energy (plus auto, textiles).",
        commonErrors: [
          "Confusing IPAP (industrial policy) with GEAR (macroeconomic policy) or AsgiSA (earlier growth initiative).",
          "Not naming specific sectors — the question usually requires examples.",
          "Treating IPAP as a once-off plan rather than a regularly updated framework."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik wat 'n Spesiale Ekonomiese Sone (SEZ) is en beskryf twee ekonomiese voordele vir SA.",
        steps: [
          "SEZ-definisie: 'n aangewysde geografiese gebied met spesiale ekonomiese regulasies om belegging te lok.",
          "SA-voorbeeld: Coega IDZ in die Oos-Kaap.",
          "Voordeel 1: Buitelandse direkte belegging — maatskappye word deur belastingaansporings gelok.",
          "Voordeel 2: Werkskepping en vaardigheidsoordrag."
        ],
        solution: "SEZ = spesiale regulasie-beleggingsone. Voordele: BDB-aantrekking, werkskepping en vaardigheidsoordrag.",
        commonErrors: [
          "SEZ's met IDZ's verwar.",
          "Nie 'n SA-spesifieke SEZ noem nie.",
          "Voordele beskryf sonder die meganisme te verduidelik."
        ]
      },
      {
        question: "Verduidelik wat voordeligmaking in die SA-konteks beteken en hoekom dit vir ekonomiese ontwikkeling belangrik is.",
        steps: [
          "Voordeligmaking: grondstowwe in hoër-waarde produkte verwerk voor uitvoer.",
          "SA-konteks: in plaas van ru-platinumerts uitvoer, dit verwerk in katalitiese omskakelaar.",
          "Ekonomiese belang 1: skep hoër-waarde uitvoere.",
          "Ekonomiese belang 2: skep meer werksgeleenthede.",
          "Ekonomiese belang 3: ontwikkel gevorderde industriële vaardighede."
        ],
        solution: "Voordeligmaking = waarde byvoeg voor uitvoer. Voordele: beter uitvoerpryse, meer werksgeleenthede, gevorderde vaardighede.",
        commonErrors: [
          "Voordeligmaking met mynbou-ekstraksie verwar.",
          "Nie voordeligmaking aan spesifieke SA-hulpbronne koppel nie.",
          "Voordeligmaking as suiwer ekonomies behandel sonder vaardigheidsontwikkeling te noem."
        ]
      },
      {
        question: "Beskryf die Industriële Beleid Aksieplan (IBAP) en identifiseer twee prioriteitsektore.",
        steps: [
          "IBAP: SA-staatsbeleid vir die groei van arbeidsabsorberende vervaardigingsnywerhede.",
          "Doel: verminder afhanklikheid van grondstofuitvoere; ontwikkel waarde-voegaanrede nywerhede.",
          "Prioriteitssektor 1: Agroverwerking — landbouprodukte verwerk vir uitvoer.",
          "Prioriteitssektor 2: Hernubare energie — sonkrag- en windkrag-vervaardiging."
        ],
        solution: "IBAP teiken arbeidsabsorberende vervaardiging. Prioriteitsektore: agroverwerking en hernubare energie.",
        commonErrors: [
          "IBAP met GEAR of AsgiSA verwar.",
          "Nie spesifieke sektore noem nie.",
          "IBAP as 'n eenmalige plan behandel eerder as 'n gereeld opgedateerde raamwerk."
        ]
      }
    ]
  },

  "ECO-7": {
    workedExamplesEn: [
      {
        question: "Explain the theory of comparative advantage and show how it benefits two trading countries.",
        steps: [
          "Comparative advantage: a country should produce and export goods in which it has a lower opportunity cost, even if it has an absolute advantage in all goods.",
          "Example: Country A can produce 100 cars OR 200 wheat bushels. Country B can produce 20 cars OR 80 wheat.",
          "A's opportunity cost of 1 car = 2 wheat; B's = 4 wheat — A has comparative advantage in cars.",
          "B's opportunity cost of 1 wheat = 0.25 cars; A's = 0.5 — B has comparative advantage in wheat.",
          "Trade: A specialises in cars, B in wheat; both trade → both consume more than they could alone."
        ],
        solution: "Comparative advantage: specialise where opportunity cost is lowest. Both countries gain from trade even if one is more productive in everything.",
        commonErrors: [
          "Confusing comparative advantage with absolute advantage (the latter means producing more — but trade still benefits both).",
          "Not calculating opportunity costs — you must compare opportunity costs, not absolute production.",
          "Concluding that the less productive country cannot benefit from trade — this is incorrect."
        ]
      },
      {
        question: "Explain the roles of the WTO, IMF, and World Bank in globalisation.",
        steps: [
          "WTO (World Trade Organisation): enforces trade rules and resolves disputes; promotes free trade by reducing tariffs and non-tariff barriers.",
          "IMF (International Monetary Fund): stabilises the international monetary system; lends to countries with balance-of-payments crises; monitors exchange rates.",
          "World Bank: provides long-term development loans and grants to developing countries for infrastructure, education and healthcare."
        ],
        solution: "WTO = trade rules. IMF = monetary stability + crisis lending. World Bank = development finance.",
        commonErrors: [
          "Confusing the IMF and World Bank — IMF stabilises currencies; World Bank funds development projects.",
          "Treating the WTO as a regulatory body that forces free trade — it negotiates agreements between member nations.",
          "Saying all three are 'globalisation organisations' without specifying their distinct functions."
        ]
      },
      {
        question: "Explain the difference between the current account and capital/financial account in South Africa's balance of payments.",
        steps: [
          "Balance of Payments (BoP): a record of all economic transactions between a country and the rest of the world.",
          "Current account: records trade in goods (exports/imports), services (tourism), income (dividends), and current transfers (remittances).",
          "Capital/financial account: records cross-border investment — FDI (factories, businesses), portfolio investment (stocks, bonds), and loans.",
          "SA context: SA often has a current account deficit (imports > exports) financed by a capital account surplus (FDI and investment inflows)."
        ],
        solution: "Current account (goods/services/income trade) vs Financial account (investment flows). SA's current deficit is typically financed by investment inflows.",
        commonErrors: [
          "Placing FDI in the current account — it belongs in the financial/capital account.",
          "Treating a current account deficit as automatically negative — it depends on what finances it.",
          "Confusing remittances (current account) with investment returns (financial account)."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die teorie van vergelykende voordeel en wys hoe dit twee handelslande bevoordeel.",
        steps: [
          "Vergelykende voordeel: 'n land moet goedere produseer en uitvoer waarin dit die laagste geleentheidskoste het.",
          "Voorbeeld: Land A kan 100 motors OF 200 koring produseer; Land B kan 20 motors OF 80 koring.",
          "A se geleentheidskoste van 1 motor = 2 koring; B se = 4 koring — A het vergelykende voordeel in motors.",
          "Handel: A spesialiseer in motors, B in koring — albei verbruik meer as wat hulle alleen kon."
        ],
        solution: "Vergelykende voordeel: spesialiseer waar geleentheidskoste laagste is. Albei lande baat by handel.",
        commonErrors: [
          "Vergelykende voordeel met absolute voordeel verwar.",
          "Nie geleentheidskoste bereken nie.",
          "Gevolgtrek dat die minder produktiewe land nie van handel kan baat nie."
        ]
      },
      {
        question: "Verduidelik die rolle van die WHO, IMF en Wêreldbank in globalisering.",
        steps: [
          "WHO (Wêreldhandelsorganisasie): handelsreëls afdwing; vrye handel bevorder.",
          "IMF (Internasionale Monetêre Fonds): internasionale monetêre stelsel stabiliseer; leen aan lande met betalingsbalanskrisis.",
          "Wêreldbank: langtermyn-ontwikkelingslening en -toelaes verskaf."
        ],
        solution: "WHO = handelsreëls. IMF = monetêre stabiliteit. Wêreldbank = ontwikkelingsfinansiering.",
        commonErrors: [
          "IMF en Wêreldbank verwar.",
          "WHO behandel as 'n regulerende liggaam wat vrye handel afdwing.",
          "Al drie as 'globaliseringsorganisasies' beskryf sonder hul onderskeidende funksies."
        ]
      },
      {
        question: "Verduidelik die verskil tussen die lopende rekening en kapitaal/finansiëlerekening in SA se betalingsbalans.",
        steps: [
          "Betalingsbalans (BB): rekord van alle ekonomiese transaksies tussen SA en die res van die wêreld.",
          "Lopende rekening: goedere-handel, dienste (toerisme), inkomste (dividende), oordragte.",
          "Kapitaal/finansiëlerekening: oorsee belegging — BDB, portefeulje-belegging, lenings.",
          "SA-konteks: lopende rekeningtekort (invoere > uitvoere) gefinansieer deur finansiëlerekening-surplus."
        ],
        solution: "Lopende rekening (goedere/dienste/inkomste-handel) vs Finansiëlerekening (beleggingsvloei). SA se tekort word tipies deur beleggingsinvloei gefinansieer.",
        commonErrors: [
          "BDB in die lopende rekening plaas.",
          "'n Lopende rekeningtekort as outomaties negatief behandel.",
          "Oordragte (lopende rekening) met beleggingsopbrengste (finansiëlerekening) verwar."
        ]
      }
    ]
  },

  "ECO-8": {
    workedExamplesEn: [
      {
        question: "Explain the effect of a tariff on imported goods, using a supply and demand diagram.",
        steps: [
          "Without tariff: world price = Pw; domestic Qd > Qs; imports = Qd − Qs.",
          "With tariff: price rises to Pw + tariff; domestic Qs increases; Qd decreases; imports fall.",
          "Effects: domestic producers gain (higher price); consumers lose (higher prices); government gains (tariff revenue).",
          "Net effect: welfare loss (deadweight loss) because some mutually beneficial trade is prevented."
        ],
        solution: "Tariff → higher price → less imports, more domestic production, consumer surplus loss, government revenue gain, net welfare loss.",
        commonErrors: [
          "Thinking tariffs help consumers — they raise prices for consumers.",
          "Not identifying the deadweight loss — there is always a welfare cost to protection.",
          "Confusing tariffs (taxes on imports) with quotas (limits on import quantities)."
        ]
      },
      {
        question: "Evaluate the infant industry argument for protectionism.",
        steps: [
          "Argument: new domestic industries cannot compete with established foreign firms — they need temporary protection to develop scale and efficiency.",
          "Supporting logic: once the industry is competitive, protection can be removed and exports can begin.",
          "SA example: the automotive industry received MIDP/APDP protection to develop — now SA exports vehicles.",
          "Counter-argument: 'temporary' protection often becomes permanent; protected industries lack incentive to improve; consumers pay higher prices throughout."
        ],
        solution: "Infant industry: protects new industries to develop competitiveness — valid in theory, but protection often becomes entrenched. SA automotive is a partial success case.",
        commonErrors: [
          "Accepting the infant industry argument uncritically without noting the risk of permanent protection.",
          "Not providing a SA-specific example.",
          "Confusing the infant industry argument with the terms-of-trade argument (which applies to powerful exporters, not new industries)."
        ]
      },
      {
        question: "Compare a tariff and a subsidy as tools to support domestic producers, noting the effect on consumers and government finances.",
        steps: [
          "Tariff: tax on imports → raises domestic price → consumers pay more → government earns revenue.",
          "Subsidy: government payment to domestic producers → allows them to lower prices → consumers benefit → government spends.",
          "Effect on producers: both help domestic producers compete with imports.",
          "Effect on consumers: tariff harms (higher prices); subsidy helps (lower prices) or neutral.",
          "Fiscal effect: tariff raises revenue; subsidy is a fiscal cost."
        ],
        solution: "Tariff: revenue for government, higher prices for consumers. Subsidy: fiscal cost for government, maintains or lowers prices for consumers.",
        commonErrors: [
          "Stating that subsidies always lower consumer prices — subsidies reduce producer costs, but may not always be passed on.",
          "Ignoring fiscal sustainability — subsidies have a long-term budget cost.",
          "Treating tariff and subsidy as equivalent — they have opposite effects on consumer prices and government finances."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die effek van 'n tarief op ingevoerde goedere, met 'n vraag-en-aanbod-diagram.",
        steps: [
          "Sonder tarief: wêreldprys = Pw; plaaslike Hv > Ha; invoere = Hv − Ha.",
          "Met tarief: prys styg na Pw + tarief; plaaslike Ha verhoog; Hv verminder; invoere daal.",
          "Effekte: plaaslike produsente wen; verbruikers verloor; regering verdien tariefinkomste.",
          "Netto-effek: welvaartsverlies (dooiegewigsverliese) omdat wedersyds voordelige handel verhoed word."
        ],
        solution: "Tarief → hoër prys → minder invoere, meer plaaslike produksie, verbruikerssurplus-verlies, staatsinkomste-wins.",
        commonErrors: [
          "Dink tariewe help verbruikers — dit verhoog pryse vir verbruikers.",
          "Nie die dooiegewig-verlies identifiseer nie.",
          "Tariewe (belastings op invoere) met kwotas (limiete op invoerhoeveelhede) verwar."
        ]
      },
      {
        question: "Evalueer die babanywerheid-argument vir proteksionisme.",
        steps: [
          "Argument: nuwe plaaslike nywerhede kan nie meeding met gevestigde buitelandse firmas nie — tydelike beskerming nodig.",
          "Ondersteunende logika: sodra die nywerheid mededingend is, kan beskerming verwyder word.",
          "SA-voorbeeld: motornywerheid het MIDP/APDP-beskerming ontvang.",
          "Teëargument: 'tydelike' beskerming word dikwels permanent; beskermde nywerhede het min aansporing om te verbeter."
        ],
        solution: "Babanywerheid: beskerm nuwe nywerhede om mededingendheid te ontwikkel — geldig in teorie, maar beskerming raak dikwels gevestig.",
        commonErrors: [
          "Die babanywerheid-argument onkrities aanvaar sonder die risiko van permanente beskerming.",
          "Nie 'n SA-spesifieke voorbeeld gee nie.",
          "Babanywerheid-argument met die handelspryse-argument verwar."
        ]
      },
      {
        question: "Vergelyk 'n tarief en 'n subsidie as instrumente om plaaslike produsente te steun.",
        steps: [
          "Tarief: belasting op invoere → plaaslike prys styg → verbruikers betaal meer → regering verdien inkomste.",
          "Subsidie: staatsbetaling aan plaaslike produsente → toelaat om pryse te verlaag → verbruikers baat → staat spandeer.",
          "Effek op produsente: albei help plaaslike produsente.",
          "Effek op verbruikers: tarief skaad (hoër pryse); subsidie help (laer pryse).",
          "Begrotingseffek: tarief genereer inkomste; subsidie is 'n begrotingskoste."
        ],
        solution: "Tarief: inkomste vir staat, hoër pryse vir verbruikers. Subsidie: begrotingskoste, behou of verlaag pryse vir verbruikers.",
        commonErrors: [
          "Sê subsidies verlaag altyd verbruikersprys — dit verminder produsentekoste maar word nie altyd deurgegee nie.",
          "Fiskale volhoubaarheid ignoreer.",
          "Tarief en subsidie as ekwivalent behandel."
        ]
      }
    ]
  },

  // ===================== GEOGRAPHY (GEO) =====================

  "GEO-1": {
    workedExamplesEn: [
      {
        question: "Describe the formation of a mid-latitude cyclone and explain the associated weather at the warm front.",
        steps: [
          "Formation: where warm tropical air meets cold polar air along the polar front — the boundary is called a front.",
          "Warm front: warm air slowly rises over denser cold air ahead of it → gradual slope.",
          "Weather at warm front: gradual sequence from high cirrus clouds, then altostratus, nimbostratus — prolonged light to moderate rain over hundreds of km ahead of the front.",
          "After warm front passes: temperature rises, pressure steadies, drizzle or clear periods."
        ],
        solution: "Warm front: gradual uplift of warm air → widespread cloud → prolonged rain. Temperature rises after front passes.",
        commonErrors: [
          "Describing a cold front's weather at the warm front — cold fronts bring short, intense storms; warm fronts bring prolonged, lighter rain.",
          "Forgetting the cloud sequence (cirrus → altostratus → nimbostratus).",
          "Not mentioning the post-frontal conditions (clearing or temperature change)."
        ]
      },
      {
        question: "Explain why a tropical cyclone loses strength when it moves inland.",
        steps: [
          "Tropical cyclones require warm ocean water (sea surface temperature ≥ 26°C) as their energy source — evaporation fuels the updrafts.",
          "When the cyclone crosses a coast and moves inland, it loses access to warm ocean moisture.",
          "Land friction also slows the wind speed.",
          "Without the moisture and heat source, the updraft weakens, convection decreases, and the cyclone dissipates."
        ],
        solution: "Tropical cyclone loses strength inland because its energy source (warm ocean moisture) is cut off — friction and moisture loss weaken the storm.",
        commonErrors: [
          "Saying the cyclone intensifies when it hits land — it does the opposite.",
          "Confusing tropical cyclones (ocean-born, warm core) with mid-latitude cyclones (front-driven, cold core).",
          "Forgetting to mention land friction as a contributing factor."
        ]
      },
      {
        question: "Describe the characteristics and effects of berg winds in South Africa.",
        steps: [
          "Origin: form over the interior plateau during winter — warm, dry air descends over the Great Escarpment.",
          "Process: as air descends, it compresses and warms adiabatically → very hot, dry winds.",
          "Direction: blows from interior toward the coast (typically from east to west over the Western Cape).",
          "Effects: extreme fire danger (low humidity + high temperature + strong wind); hazardous for farming (crops wilt, grapes heat-damaged); associated with widespread fires in the Western Cape."
        ],
        solution: "Berg winds = hot, dry descending air from plateau. Effects: fire danger, crop damage, extreme heat on the coast.",
        commonErrors: [
          "Confusing berg winds with trade winds — completely different mechanisms.",
          "Not explaining the adiabatic warming process (compression as air descends = warming).",
          "Forgetting to link berg winds to fire risk in the Western Cape."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Beskryf die vorming van 'n mid-breedte sikloon en verduidelik die gepaardgaande weer by die warm front.",
        steps: [
          "Vorming: warm tropiese lug ontmoet koue poolse lug langs die poolfront.",
          "Warm front: warm lug styg stadig oor digter koue lug.",
          "Weer by warm front: geleidelike reeks vanaf hoë sirruskolk, dan altostratus, nimbostratus → verlengde ligte reën.",
          "Na warm front verbygaan: temperatuur styg, druk stabiliseer."
        ],
        solution: "Warm front: geleidelike opwaartse beweging → wydverspreide wolke → verlengde reën. Temperatuur styg na front verbygaan.",
        commonErrors: [
          "Koue front se weer by warm front beskryf.",
          "Die wolkereeks vergeet.",
          "Nie post-frontale toestande noem nie."
        ]
      },
      {
        question: "Verduidelik hoekom 'n tropiese sikloon swakker word wanneer dit binneland beweeg.",
        steps: [
          "Tropiese siklone benodig warm oseaanwater (oppervlaktemperatuur ≥ 26°C) as hul energiebron.",
          "Wanneer die sikloon kus oorsteek en binneland beweeg, verloor dit toegang tot warm oseaanvog.",
          "Grondwrywing vertraag ook die windspoed.",
          "Sonder vogtigheid en hittebron verswak die opwaartse trek en verswak die sikloon."
        ],
        solution: "Tropiese sikloon verswak binneland omdat sy energiebron (warm oseaanvog) afgesny word.",
        commonErrors: [
          "Sê die sikloon intensifiseer wanneer dit land tref.",
          "Tropiese siklone met mid-breedte siklone verwar.",
          "Grondwrywing as 'n bydraende faktor vergeet."
        ]
      },
      {
        question: "Beskryf die eienskappe en effekte van bergwinde in Suid-Afrika.",
        steps: [
          "Oorsprong: vorm oor die binneplato tydens winter — warm, droë lug daal oor die Groot Skerprand.",
          "Proses: lug komprimeer en word adiabaties warm → baie warm, droë winde.",
          "Rigting: blaas van binneland na kus.",
          "Effekte: uiterste brandgevaar; gevaarlik vir boerdery; wyd verspreide brande in die Wes-Kaap."
        ],
        solution: "Bergwinde = warm, droë dalende lug van plato. Effekte: brandgevaar, oesbeskadiging, uiterste hitte op die kus.",
        commonErrors: [
          "Bergwinde met pasaatwinde verwar.",
          "Die adiabatiese verwarmingsproses nie verduidelik nie.",
          "Vergeet om bergwinde aan brandrisiko in die Wes-Kaap te koppel."
        ]
      }
    ]
  },

  "GEO-2": {
    workedExamplesEn: [
      {
        question: "Describe the four processes of river erosion and explain which dominates in each stage of the river's long profile.",
        steps: [
          "Hydraulic action: force of water dislodges material from the channel — dominant in upper course (fast, powerful).",
          "Abrasion: bed and banks scoured by sediment carried by water — dominant in middle course.",
          "Attrition: sediment particles collide and break each other into smaller fragments — dominant in middle-lower course.",
          "Solution (corrosion): chemical weathering dissolves soluble rock — operates throughout."
        ],
        solution: "Upper course: hydraulic action dominant. Middle: abrasion. Lower: attrition and deposition. Solution operates throughout.",
        commonErrors: [
          "Confusing abrasion (sediment scraping) with attrition (sediment-on-sediment collision).",
          "Placing hydraulic action only in the upper course — it operates throughout but is strongest there.",
          "Confusing corrasion (mechanical abrasion) with corrosion (chemical solution)."
        ]
      },
      {
        question: "Explain how a meander forms and describe what happens when it becomes a cut-off lake.",
        steps: [
          "Meander formation: lateral erosion in the middle/lower course creates gentle curves; faster water on the outside of bends erodes the bank (undercutting), slower water on the inside deposits sediment (point bar).",
          "This asymmetry causes the meander to migrate and become increasingly sinuous.",
          "Cut-off: when the meander curves so tightly that the river cuts through the narrow neck of land between two bends.",
          "Oxbow lake (vlei): the abandoned meander is sealed off by sediment deposition, forming a crescent-shaped lake."
        ],
        solution: "Meander: outside erosion + inside deposition → increasing sinuosity. Cut-off → oxbow lake when neck is breached and sealed by sediment.",
        commonErrors: [
          "Confusing the inside (deposition/point bar) and outside (erosion/undercut) of a meander.",
          "Not explaining the cut-off mechanism — the river cuts through the neck, not around the bend.",
          "Calling the resulting feature a 'lake' without specifying it is an oxbow/vlei cut off by sediment."
        ]
      },
      {
        question: "Describe catchment management in South Africa and explain why it is important.",
        steps: [
          "Catchment: the area of land that drains to a common watercourse.",
          "Catchment Management Agencies (CMAs): established under the National Water Act (1998) to manage water resources within defined water management areas.",
          "Importance 1: sustainable water supply — managing catchments prevents over-extraction and pollution.",
          "Importance 2: SA is a water-scarce country (annual rainfall < world average) — efficient management is critical.",
          "Importance 3: balances competing demands — urban, agricultural and industrial users in the same catchment."
        ],
        solution: "CMAs manage SA's 19 water management areas. Critical because SA is water-scarce and must balance competing demands for a limited resource.",
        commonErrors: [
          "Not knowing that SA is water-scarce — this is a key contextual fact for all water questions.",
          "Confusing CMAs with the Lesotho Highlands Water Project — the LHWP transfers water; CMAs manage it.",
          "Treating catchment management as only about floods — it covers all water uses and sustainability."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Beskryf die vier prosesse van riviererosie en verduidelik watter in elke fase van die rivierlangsnitprofiel domineer.",
        steps: [
          "Hidrouliese aksie: waterkrag los materiaal los — domineer in boonste loop (vinnig, kragtig).",
          "Skuring (abrasie): rivierbedding en -banke deur sediment geskuur — middelloop.",
          "Atritie: sedimentpartikels bots en breek in kleiner stukke — middelste-onderste loop.",
          "Oplossing (korrosie): chemiese verwering los oplosbare rots op — regdeur."
        ],
        solution: "Boonste loop: hidrouliese aksie. Middel: skuring. Onderste: atritie en deposisie. Oplossing regdeur.",
        commonErrors: [
          "Skuring (sediment skuur) met atritie (sediment-op-sediment botsing) verwar.",
          "Hidrouliese aksie slegs in die boonste loop plaas.",
          "Korrasie (meganiese skuring) met korrosie (chemiese oplossing) verwar."
        ]
      },
      {
        question: "Verduidelik hoe 'n meander vorm en beskryf wat gebeur wanneer dit 'n afgesnyde meer word.",
        steps: [
          "Meandervorming: laterale erosie in die middelste/onderste loop skep sagte boë.",
          "Vinniger water aan die buitekant van boë erodeer die bank (ondersnyding); stadiger water binnekant plaas sediment (puntsandbank).",
          "Afsnit: wanneer die meander so krom raak dat die rivier deur die nou nek land sny.",
          "Osseboogmeer (vlei): die verlate meander word deur sediment geseël."
        ],
        solution: "Meander: buitekant erosie + binnekant deposisie → toenemende kronkeling. Afsnit → osseboogmeer wanneer nek deurbreek en deur sediment geseël.",
        commonErrors: [
          "Binnekant (deposisie) en buitekant (erosie) van meander verwar.",
          "Die afsnit-meganisme nie verduidelik nie.",
          "Die resulterende kenmerk 'meer' noem sonder te spesifiseer dit is 'n osseboogmeer afgesny deur sediment."
        ]
      },
      {
        question: "Beskryf opvangsbestuur in SA en verduidelik hoekom dit belangrik is.",
        steps: [
          "Opvangsgebied: die grondoppervlakte wat na 'n gemeenskaplike waterloop dreineer.",
          "Opvangsbestuursagentskappe (OBA's): gestig onder die Nasionale Waterwet (1998) om waterbronne binne gedefinieerde waterbestuursgebiede te bestuur.",
          "Belang 1: volhoubare watervoorraad — voorkom oor-onttrekking en besoedeling.",
          "Belang 2: SA is waterarm (jaarlikse reënval < wêreldgemiddeld).",
          "Belang 3: balanseer mededingende behoeftes."
        ],
        solution: "OBA's bestuur SA se 19 waterbestuursgebiede. Krities omdat SA waterarm is en beperkte hulpbronne balanseer.",
        commonErrors: [
          "Nie weet SA is waterarm nie.",
          "OBA's met die Lesotho Hooglande Waterprojek verwar.",
          "Opvangsbestuur as slegs oor vloede behandel."
        ]
      }
    ]
  },

  "GEO-3": {
    workedExamplesEn: [
      {
        question: "Describe the spatial legacy of apartheid in South African urban areas and identify two contemporary challenges it causes.",
        steps: [
          "Apartheid spatial planning: Group Areas Act forced different races to live in separate areas — non-white residents placed far from city centres, employment and services.",
          "Legacy 1: urban sprawl — low-density townships far from economic centres (e.g. Soweto from Johannesburg CBD).",
          "Challenge 1: long commutes and high transport costs for low-income residents.",
          "Challenge 2: inadequate services (water, sanitation, electricity) in many former townships due to historical under-investment."
        ],
        solution: "Apartheid legacy: spatially separated cities. Challenges: long commutes for poor residents + service delivery backlogs in townships.",
        commonErrors: [
          "Describing apartheid without linking it to current urban structure — the question asks for contemporary challenges.",
          "Not identifying two distinct challenges — general poverty is not a spatial challenge.",
          "Confusing spatial planning policies with social policies — the spatial legacy specifically refers to where people were forced to live."
        ]
      },
      {
        question: "Compare the Burgess concentric zone model and the Hoyt sector model of urban land use, noting one strength and one weakness of each.",
        steps: [
          "Burgess model: city grows outward in concentric rings — CBD in centre, surrounded by transition zone, then working class, middle class, commuter zone.",
          "Strength: captures the gradient of land values from centre outward. Weakness: assumes uniform terrain and ignores transport corridors.",
          "Hoyt model: cities grow in sectors (wedges) along transport routes — high-income sectors along rivers or rail lines.",
          "Strength: recognises transport influence on city shape. Weakness: oversimplifies to sectors and ignores historical factors."
        ],
        solution: "Burgess (rings, land value gradient) vs Hoyt (sectors along transport). Both are simplified models — real cities are messier.",
        commonErrors: [
          "Treating either model as a description of reality — they are theoretical frameworks developed on American/European cities.",
          "Not identifying a weakness for each model.",
          "Confusing the CBD position in both models — both place the CBD in the centre; the difference is how land use radiates from it."
        ]
      },
      {
        question: "Explain two pull factors and two push factors driving urbanisation in South Africa.",
        steps: [
          "Pull factors (attract people to cities): employment opportunities (formal and informal sector jobs); access to services (hospitals, schools, transport); perceived higher quality of life.",
          "Push factors (drive people away from rural areas): lack of employment in rural areas; drought and agricultural failure; limited educational and healthcare facilities.",
          "SA context: urban population is approximately 68% (2020) — one of Africa's most urbanised countries."
        ],
        solution: "Pull: jobs + services. Push: rural unemployment + drought + service absence. SA is rapidly urbanising — 68% urban by 2020.",
        commonErrors: [
          "Confusing pull (city attractions) and push (rural problems) factors.",
          "Giving only one factor for each category when two are required.",
          "Not mentioning SA-specific examples (Johannesburg as employment hub; Eastern Cape drought as push factor)."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Beskryf die ruimtelike erfenis van apartheid in SA-stedelike gebiede en identifiseer twee hedendaagse uitdagings.",
        steps: [
          "Apartheid-ruimtelike beplanning: Groepsgebiedewet het verskillende rasse gedwing om apart te woon — nie-wit inwoners ver van stadssentrums.",
          "Erfenis: stedelike uitbreiding — lae-digtheid township ver van ekonomiese sentrums.",
          "Uitdaging 1: lang pendelroetes en hoë vervoerkoste vir lae-inkomste-inwoners.",
          "Uitdaging 2: onvoldoende dienste in voormalige townships."
        ],
        solution: "Apartheid-erfenis: ruimtelik geskei stede. Uitdagings: lang pendelroetes + dienstelewerings-agterstand.",
        commonErrors: [
          "Apartheid beskryf sonder om dit aan huidige stedelike struktuur te koppel.",
          "Nie twee onderskeidende uitdagings identifiseer nie.",
          "Ruimtelike beplanning beleide met sosiale beleide verwar."
        ]
      },
      {
        question: "Vergelyk die Burgess-konsentriese-sone-model en die Hoyt-sektormodel, met een sterk- en een swakpunt van elk.",
        steps: [
          "Burgess-model: stad groei uitwaarts in konsentriese ringe — SSG in middel, omring deur oorgangssone, dan werkers, middelklas.",
          "Sterkpunt: weerspieël grondwaarde-gradiënt. Swakpunt: aanvaar eenvormige terrein.",
          "Hoyt-model: stede groei in sektore langs vervoerroetes.",
          "Sterkpunt: erken vervoer se invloed. Swakpunt: oorvereenvoudig."
        ],
        solution: "Burgess (ringe, grondwaarde-gradiënt) vs Hoyt (sektore langs vervoer). Albei is vereenvoudigde modelle.",
        commonErrors: [
          "Enige model as 'n beskrywing van werklikheid behandel.",
          "Nie 'n swakpunt vir elke model identifiseer nie.",
          "Die SSG-posisie in albei modelle verwar."
        ]
      },
      {
        question: "Verduidelik twee aantrekkingsfaktore en twee stootfaktore wat verstedeliking in SA aandryf.",
        steps: [
          "Aantrekkingsfaktore: werksgeleenthede; toegang tot dienste.",
          "Stootfaktore: gebrek aan werk in landelike gebiede; droogte; beperkte opvoedings- en gesondheidsgeriewe.",
          "SA-konteks: stedelike bevolking is ±68% (2020)."
        ],
        solution: "Aantrekking: werksgeleenthede + dienste. Stoot: landelike werkloosheid + droogte. SA verstedelik vinnig.",
        commonErrors: [
          "Aantrekkings- en stootfaktore verwar.",
          "Slegs een faktor vir elke kategorie gee.",
          "Nie SA-spesifieke voorbeelde noem nie."
        ]
      }
    ]
  },

  "GEO-4": {
    workedExamplesEn: [
      {
        question: "Classify the following activities and explain their sector: (a) diamond mining, (b) car assembly, (c) banking, (d) AI research.",
        steps: [
          "(a) Diamond mining → Primary sector: extraction of natural resources from the earth.",
          "(b) Car assembly → Secondary sector: manufacturing/processing raw materials into finished goods.",
          "(c) Banking → Tertiary sector: providing financial services to consumers and businesses.",
          "(d) AI research → Quaternary sector: knowledge-based, information and technology activities."
        ],
        solution: "(a) Primary; (b) Secondary; (c) Tertiary; (d) Quaternary.",
        commonErrors: [
          "Placing banking in the secondary sector — banking provides a service, not a physical product.",
          "Confusing quaternary (knowledge/tech) with tertiary (all other services).",
          "Classifying mining differently from farming — both are primary sector (natural resource extraction)."
        ]
      },
      {
        question: "Explain the concept of deindustrialisation and give one example of its impact on a South African city.",
        steps: [
          "Deindustrialisation: the decline of manufacturing activity in a region, often as industries move to cheaper production locations or are replaced by technology.",
          "SA example: East London (Eastern Cape) once had a vibrant textile and manufacturing sector; global competition and cheaper imports caused factory closures and job losses.",
          "Urban impact: unemployment rises in former industrial areas; urban decay in manufacturing zones; skills mismatch as former factory workers cannot easily transition to service jobs."
        ],
        solution: "Deindustrialisation = manufacturing decline. East London example: textiles declined → unemployment + urban decay in former factory areas.",
        commonErrors: [
          "Confusing deindustrialisation with development (moving from primary to secondary) — deindustrialisation is the reverse.",
          "Not giving a specific SA city example.",
          "Ignoring the human impact (job losses, skills mismatch) — geography exams require socio-economic consequences."
        ]
      },
      {
        question: "Explain how tourism functions as a tertiary industry and describe two economic benefits it brings to South Africa.",
        steps: [
          "Tourism = tertiary industry: provides a service experience (not a physical product) — accommodation, transport, entertainment, catering.",
          "Economic benefit 1: foreign exchange earnings — international tourists spend foreign currency in SA (hotels, restaurants, activities).",
          "Economic benefit 2: job creation — tourism directly employs guides, hotel staff, restaurateurs; indirectly supports farmers, transport providers."
        ],
        solution: "Tourism = tertiary (service industry). Benefits: foreign exchange + job creation (direct and indirect).",
        commonErrors: [
          "Classifying tourism as a primary industry because it uses natural resources (landscapes, wildlife) — tourism is a service.",
          "Not distinguishing direct from indirect employment — both count for the economic multiplier.",
          "Not quantifying: SA tourism contributed ±R425 billion to GDP pre-COVID — contextualising scale is useful."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Klassifiseer die volgende aktiwiteite: (a) diamantmynbou, (b) motormontering, (c) bankwese, (d) KI-navorsing.",
        steps: [
          "(a) Diamantmynbou → Primêre sektor: onttrekking van natuurlike hulpbronne.",
          "(b) Motormontering → Sekondêre sektor: vervaardiging.",
          "(c) Bankwese → Tersiêre sektor: finansiëledienste.",
          "(d) KI-navorsing → Kwartêre sektor: kennisgebaseerde aktiwiteite."
        ],
        solution: "(a) Primêr; (b) Sekondêr; (c) Tersiêr; (d) Kwartêr.",
        commonErrors: [
          "Bankwese in die sekondêre sektor plaas.",
          "Kwartêr (kennis/tegnologie) met tersiêr (alle ander dienste) verwar.",
          "Mynbou anders as boerdery klassifiseer — albei is primêr."
        ]
      },
      {
        question: "Verduidelik die konsep van de-industrialisering en gee een voorbeeld van die impak op 'n SA-stad.",
        steps: [
          "De-industrialisering: afname in vervaardigingsaktiwiteit in 'n streek.",
          "SA-voorbeeld: Oos-Londen het eens 'n lewendige tekstiel- en vervaardingsektor gehad; globale mededinging het fabrieksluitings veroorsaak.",
          "Stedelike impak: werkloosheid styg; stedelike verval in voormalige industriële gebiede."
        ],
        solution: "De-industrialisering = vervaardigingsafname. Oos-Londen: tekstiele het verval → werkloosheid + stedelike verval.",
        commonErrors: [
          "De-industrialisering met ontwikkeling verwar.",
          "Nie 'n spesifieke SA-stad noem nie.",
          "Menslike impak ignoreer."
        ]
      },
      {
        question: "Verduidelik hoe toerisme as 'n tersiêre nywerheid funksioneer en beskryf twee ekonomiese voordele vir SA.",
        steps: [
          "Toerisme = tersiêre nywerheid: bied 'n dienservaring (nie 'n fisiese produk).",
          "Ekonomiese voordeel 1: buitelandse valuta-verdienste — internasionale toeriste bestee buitelandse valuta.",
          "Ekonomiese voordeel 2: werkskepping — direk huur gidse, hotelspersoneel; indirek ondersteun boere, vervoerverskaffers."
        ],
        solution: "Toerisme = tersiêr (dienstesektor). Voordele: buitelandse valuta + werkskepping (direk en indirek).",
        commonErrors: [
          "Toerisme as primêr klassifiseer omdat dit natuurlike hulpbronne gebruik.",
          "Nie direkte van indirekte indiensneming onderskei nie.",
          "Nie omvang kwantifiseer nie."
        ]
      }
    ]
  },

  "GEO-5": {
    workedExamplesEn: [
      {
        question: "Calculate the bearing from point A to point B using a topographic map, given that B is to the northeast of A.",
        steps: [
          "Draw a North line at point A.",
          "Draw a line from A to B.",
          "Measure the angle clockwise from North to the A-B line.",
          "A bearing must be expressed as a three-digit angle (e.g. 045°, not 45° NE)."
        ],
        solution: "If B is exactly northeast of A: bearing = 045°. Bearings are always measured clockwise from North, expressed in three digits.",
        commonErrors: [
          "Measuring from South or East instead of from North — bearings always start from North.",
          "Using compass point names (NE) instead of three-digit bearings (045°) — the question usually specifies which format.",
          "Forgetting that 360° and 000° are the same (North)."
        ]
      },
      {
        question: "Calculate the actual distance between two points on a 1:50 000 topographic map if they are 8 cm apart on the map.",
        steps: [
          "Scale 1:50 000 means 1 cm = 50 000 cm in reality.",
          "Actual distance = 8 cm × 50 000 = 400 000 cm.",
          "Convert to km: 400 000 cm ÷ 100 = 4 000 m ÷ 1 000 = 4 km."
        ],
        solution: "Actual distance = 4 km.",
        commonErrors: [
          "Dividing by the scale factor instead of multiplying.",
          "Forgetting to convert cm to m to km.",
          "Reading the scale incorrectly: 1:50 000 ≠ 1:5 000 — always check the scale bar."
        ]
      },
      {
        question: "Explain what GIS (Geographic Information Systems) is and describe two advantages it has over traditional paper maps.",
        steps: [
          "GIS: a computer-based system that captures, stores, analyses and displays geographic data in layers.",
          "Advantage 1: layers — different types of information (roads, elevation, land use, population) can be overlaid and analysed together.",
          "Advantage 2: real-time updating — digital maps can be updated instantly (e.g. traffic data, disaster mapping) unlike printed maps.",
          "Additional advantage: spatial analysis — GIS can answer questions like 'which areas within 5 km of a school have no access to water?'"
        ],
        solution: "GIS = layered digital geographic analysis. Advantages over paper: layering/analysis + real-time updating.",
        commonErrors: [
          "Describing GIS as just a digital map — the key feature is spatial analysis and layering, not just display.",
          "Not contrasting with paper maps when the question asks for advantages over traditional maps.",
          "Treating remote sensing (satellite images) as GIS — they are different (remote sensing provides data; GIS analyses it)."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Bereken die kompaspeiling van punt A na punt B as B noordoos van A is.",
        steps: [
          "Teken 'n Noordlyn by punt A.",
          "Teken 'n lyn van A na B.",
          "Meet die hoek met die uurwyser van Noord tot die A-B-lyn.",
          "Peiling moet as 'n drie-syfer hoek uitgedruk word."
        ],
        solution: "As B presies noordoos van A is: peiling = 045°. Peilings word altyd met die uurwyser van Noord gemeet.",
        commonErrors: [
          "Van Suid of Oos meet in plaas van Noord.",
          "Kompaspuntnaam (NO) gebruik in plaas van drie-syfer peiling (045°).",
          "Vergeet 360° en 000° is dieselfde (Noord)."
        ]
      },
      {
        question: "Bereken die werklike afstand tussen twee punte op 'n 1:50 000 topografiese kaart as hulle 8 cm uitmekaar is.",
        steps: [
          "Skaal 1:50 000: 1 cm = 50 000 cm in werklikheid.",
          "Werklike afstand = 8 × 50 000 = 400 000 cm.",
          "Omskakel na km: 400 000 ÷ 100 = 4 000 m ÷ 1 000 = 4 km."
        ],
        solution: "Werklike afstand = 4 km.",
        commonErrors: [
          "Deur die skaalfaktor deel in plaas van vermenigvuldig.",
          "Vergeet om na km te omskakel.",
          "Die skaal verkeerd lees."
        ]
      },
      {
        question: "Verduidelik wat GIS is en beskryf twee voordele bo tradisionele papierkaarte.",
        steps: [
          "GIS: 'n rekenaar-gebaseerde stelsel wat geografiese data in lae vasvang, stoor, ontleed en vertoon.",
          "Voordeel 1: lae — verskillende tipes inligting kan saam oorgelê en ontleed word.",
          "Voordeel 2: intydse opdatering — digitale kaarte kan onmiddellik opdateer."
        ],
        solution: "GIS = gelaagde digitale geografiese analise. Voordele: laer-analise + intydse opdatering.",
        commonErrors: [
          "GIS as slegs 'n digitale kaart beskryf.",
          "Nie met papierkaarte kontrasteer nie wanneer die vraag dit versoek.",
          "Afstandswaarneming (satellietbeelde) as GIS behandel."
        ]
      }
    ]
  },

  "GEO-6": {
    workedExamplesEn: [
      {
        question: "Explain the Lesotho Highlands Water Project (LHWP) and describe two benefits for South Africa.",
        steps: [
          "LHWP: a bi-national water transfer scheme between Lesotho and South Africa, transferring water from the Maluti Mountains in Lesotho to Gauteng's Vaal River system.",
          "Key infrastructure: Katse Dam, Mohale Dam, tunnels and pump stations.",
          "SA Benefit 1: water security for Gauteng — the LHWP provides approximately 40% of Gauteng's water, supporting the largest metropolitan region in Africa.",
          "SA Benefit 2: economic — Gauteng's water supply supports the industrial and manufacturing heartland of SA, generating GDP."
        ],
        solution: "LHWP = Lesotho-SA water transfer. Benefits: water security for Gauteng (40% of supply) + supports Gauteng economy.",
        commonErrors: [
          "Confusing the LHWP with CMAs — LHWP is a specific infrastructure project; CMAs are management bodies.",
          "Not knowing that it serves Gauteng specifically — the Vaal River system is the key link.",
          "Not mentioning the bilateral (two-country) nature — Lesotho benefits through royalties and electricity."
        ]
      },
      {
        question: "Describe two strategies for domestic water demand management in South Africa.",
        steps: [
          "Strategy 1: Water tariff structure (rising block tariffs) — first 6 kL/household/month free; higher tariffs for higher usage → incentivises conservation.",
          "Strategy 2: Water-wise education campaigns — teaching households to use rainwater harvesting, fix leaks, use water-efficient appliances.",
          "Supplementary: restrictions and by-laws (e.g. odd/even day garden watering during drought) — Day Zero planning in Cape Town (2018) as SA's most dramatic example."
        ],
        solution: "Demand management: rising block tariffs (penalise excess) + water-wise education. Cape Town Day Zero is SA's most extreme example.",
        commonErrors: [
          "Describing water supply strategies (building dams) instead of demand management (reducing use).",
          "Not including a SA-specific example — Day Zero is a highly relevant, frequently tested case.",
          "Treating conservation as only a residential issue — industrial and agricultural users are the largest consumers."
        ]
      },
      {
        question: "Explain the concept of water scarcity and classify South Africa in terms of global water availability benchmarks.",
        steps: [
          "Water scarcity: when demand for water exceeds available supply — physical scarcity (dry climate) or economic scarcity (infrastructure lacks to access water).",
          "Global benchmark: < 1 700 m³/person/year = water stress; < 1 000 m³/year = water scarcity; < 500 m³/year = absolute scarcity.",
          "SA classification: approximately 1 000 m³/person/year — at the threshold of water scarcity. SA's average rainfall (450 mm/year) is less than half the world average (800 mm/year)."
        ],
        solution: "SA = water scarce (≈ 1 000 m³/person/year). Low rainfall + growing population push demand beyond sustainable supply.",
        commonErrors: [
          "Not knowing the benchmark values — 1 700, 1 000 and 500 m³/person/year are standard exam figures.",
          "Treating all water problems as physical scarcity — many SA communities suffer economic scarcity (water exists but infrastructure is absent).",
          "Not quantifying SA's rainfall compared to the world average."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die Lesotho Hooglande Waterprojek (LHWP) en beskryf twee voordele vir SA.",
        steps: [
          "LHWP: 'n tweetalige wateroorplasingstelsel tussen Lesotho en SA, wat water uit die Maluti-berge na Gauteng se Vaalrivier-stelsel oorplaas.",
          "Sleutelinfrastruktuur: Katse-dam, Mohale-dam, tonnels en pomp-stasies.",
          "SA-voordeel 1: watersekerheid vir Gauteng — LHWP verskaf ±40% van Gauteng se water.",
          "SA-voordeel 2: ekonomies — Gauteng se watervoorraad ondersteun die industriële hartland van SA."
        ],
        solution: "LHWP = Lesotho-SA-wateroorplasing. Voordele: watersekerheid vir Gauteng (40% van voorraad) + ondersteun Gauteng-ekonomie.",
        commonErrors: [
          "LHWP met OBA's verwar.",
          "Nie weet dit dien Gauteng spesifiek nie.",
          "Nie die bilaterale aard noem nie."
        ]
      },
      {
        question: "Beskryf twee strategieë vir huishoudelike wateraanvraagbestuur in SA.",
        steps: [
          "Strategie 1: Waterkoopstruktuur (stygende blok-tariewe) — eerste 6 kL/maand gratis; hoër tariewe vir hoër gebruik.",
          "Strategie 2: Waterwys-opvoedingsveldtogte — reënwaterversameling, lekkasies herstel.",
          "Aanvullend: beperkings (bv. onewe/ewe dag tuin besproeiing)."
        ],
        solution: "Aanvraagbestuur: stygende blok-tariewe + waterwys-opvoeding. Kaapstad Dag Nul is SA se mees dramatiese voorbeeld.",
        commonErrors: [
          "Watervoorsieningstrategieë beskryf in plaas van aanvraagbestuur.",
          "Nie 'n SA-spesifieke voorbeeld insluit nie.",
          "Bewaring as slegs 'n residensiële kwessie behandel."
        ]
      },
      {
        question: "Verduidelik waterskaarsheid en klassifiseer SA in terme van globale waterbesikbaarheidsmaatstaf.",
        steps: [
          "Waterskaarsheid: wanneer vraag die beskikbare voorraad oorskry.",
          "Globale maatstaf: < 1 700 m³/persoon/jaar = waterstres; < 1 000 = waterskaarsheid; < 500 = absolute skaarsheid.",
          "SA-klassifikasie: ±1 000 m³/persoon/jaar — by die drempel van waterskaarsheid. SA se reënval (450 mm/jaar) is minder as die helfte van die wêreldgemiddeld."
        ],
        solution: "SA = waterarm (≈ 1 000 m³/persoon/jaar). Lae reënval + groeiende bevolking dryf vraag bo volhoubare voorraad.",
        commonErrors: [
          "Nie die maatstaf-waardes ken nie.",
          "Alle waterprobleme as fisiese skaarsheid behandel.",
          "SA se reënval nie met die wêreldgemiddeld vergelyk nie."
        ]
      }
    ]
  },

  // ===================== HISTORY (HIS) =====================

  "HIS-1": {
    workedExamplesEn: [
      {
        question: "Explain why the Berlin Blockade (1948-49) is considered a key escalation of the Cold War.",
        steps: [
          "Context: after WWII, Germany was divided into four occupation zones; Berlin, inside the Soviet zone, was also divided.",
          "Event: June 1948 — USSR blockaded all land routes into West Berlin to force Western powers out.",
          "Western response: Berlin Airlift — USA and UK flew supplies into West Berlin for 11 months (over 200 000 flights).",
          "Significance: demonstrated Western resolve; reinforced the ideological divide; led to the formation of NATO (1949)."
        ],
        solution: "Blockade = USSR attempt to starve West Berlin into submission → Airlift showed Western defiance → deepened Cold War + triggered NATO formation.",
        commonErrors: [
          "Confusing the 1948 Berlin Blockade with the 1961 Berlin Wall — different events, different phases.",
          "Not mentioning the Airlift as the key Western response.",
          "Not connecting the Blockade to its broader consequence (NATO, German rearmament)."
        ]
      },
      {
        question: "Explain the concept of Mutually Assured Destruction (MAD) and evaluate its effectiveness in preventing nuclear war.",
        steps: [
          "MAD: the doctrine that if either superpower launched a nuclear first strike, the other retained enough nuclear capability to destroy the attacker — making any nuclear war suicidal for both sides.",
          "Effectiveness — supporting: no direct nuclear exchange occurred between the US and USSR in 45 years of Cold War.",
          "Effectiveness — critique: MAD required both sides to remain rational; miscalculation could trigger war (e.g. Cuban Missile Crisis, 1962, came close).",
          "Legacy: arms limitation treaties (SALT I, 1972; SALT II, 1979) emerged from MAD logic."
        ],
        solution: "MAD = nuclear deterrence through mutually suicidal risk. Effective in practice (no war) but fragile — rationality cannot be guaranteed.",
        commonErrors: [
          "Treating MAD as a formal treaty — it is a strategic doctrine/theory, not a signed agreement.",
          "Not evaluating both sides (effectiveness and limitations).",
          "Confusing SALT (arms limitation) with MAD (deterrence doctrine)."
        ]
      },
      {
        question: "How did propaganda shape public opinion during the Cold War? Give one example from each superpower.",
        steps: [
          "Function of propaganda: governments used media, education and culture to reinforce ideological loyalty and demonise the opponent.",
          "USA example: McCarthyism (1950s) — Senator McCarthy led anti-communist hearings; Hollywood blacklists; 'Reds under the bed' paranoia.",
          "USSR example: Soviet media portrayed capitalism as exploitative and crisis-prone; Sputnik (1957) as technological propaganda demonstrating communist superiority.",
          "Effect: public opinion in both countries supported Cold War spending and military build-up."
        ],
        solution: "Cold War propaganda: USA (McCarthyism, Red Scare) → anti-communism; USSR (Sputnik, anti-capitalism media) → pro-communism.",
        commonErrors: [
          "Not providing one example from each side — the question specifies both.",
          "Describing propaganda without explaining its mechanism (how it shaped opinion).",
          "Confusing propaganda's targets (domestic audiences vs foreign audiences) — Cold War propaganda operated on both levels."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik hoekom die Berlyn-blokkade (1948-49) as 'n sleutel-eskalasie van die Koue Oorlog beskou word.",
        steps: [
          "Konteks: na WWII is Duitsland in vier besettingsones verdeel; Berlyn, binne die Sowjet-sone, was ook verdeel.",
          "Gebeure: Junie 1948 — USSR het alle grondroetes na Wes-Berlyn geblokkeer.",
          "Westerse reaksie: Berlyn-lugbrug — VSA en VK het voorrade 11 maande lank gevlieg.",
          "Betekenis: Westerse vasbeslotenweid; versterkte ideologiese verdeling; lei tot NAVO (1949)."
        ],
        solution: "Blokkade = USSR-poging om Wes-Berlyn te verhonger → Lugbrug het Westerse verset getoon → Koue Oorlog verdiep + NAVO gestig.",
        commonErrors: [
          "1948 Berlyn-blokkade met 1961 Berlynse Muur verwar.",
          "Nie die Lugbrug as die sleutel Westerse reaksie noem nie.",
          "Nie die Blokkade aan sy breër gevolg koppel nie."
        ]
      },
      {
        question: "Verduidelik die konsep van Wedersydse Versekerde Vernietiging (WVV) en evalueer die doeltreffendheid in die voorkoming van kernoorlog.",
        steps: [
          "WVV: die leer dat as enige supermag 'n eerste kernstaking loods, die ander genoeg kernkapasiteit behou om die aanvaller te vernietig.",
          "Doeltreffendheid — ondersteunend: geen direkte kernuitruiling het in 45 jaar Koue Oorlog plaasgevind nie.",
          "Doeltreffendheid — kritiek: WVV vereis dat albei kante rasioneel bly; wankalkullering kon oorlog aktiveer.",
          "Erfenis: wapenbeperking-verdrae (SALT I, 1972; SALT II, 1979) het uit WVV-logika ontstaan."
        ],
        solution: "WVV = nukleêre afskrikking deur wedersyds selfmoord-risiko. Doeltreffend in praktyk maar broos.",
        commonErrors: [
          "WVV as 'n formele verdrag behandel.",
          "Nie albei kante evalueer nie.",
          "SALT met WVV verwar."
        ]
      },
      {
        question: "Hoe het propaganda openbare mening gedurende die Koue Oorlog gevorm? Gee een voorbeeld van elke supermag.",
        steps: [
          "Funksie: regerings het media, opvoeding en kultuur gebruik om ideologiese lojaliteit te versterk.",
          "VSA-voorbeeld: McCarthyisme (1950s) — Senator McCarthy het anti-kommunistiese verhore gelei.",
          "USSR-voorbeeld: Sowjet-media het kapitalisme as uitbuitend voorgestel; Sputnik (1957) as tegnologiese propaganda.",
          "Effek: openbare mening ondersteun Koue Oorlog-besteding en militêre opbou."
        ],
        solution: "Koue Oorlog-propaganda: VSA (McCarthyisme) → anti-kommunisme; USSR (Sputnik) → pro-kommunisme.",
        commonErrors: [
          "Nie een voorbeeld van elk gee nie.",
          "Propaganda beskryf sonder die meganisme te verduidelik.",
          "Propaganda se teikens verwar."
        ]
      }
    ]
  },

  "HIS-2": {
    workedExamplesEn: [
      {
        question: "Explain how the Solidarity trade union in Poland (1980) challenged communist authority.",
        steps: [
          "Origin: 1980 — workers at Gdańsk shipyards went on strike, led by Lech Wałęsa, demanding free trade unions and workers' rights.",
          "Challenge: Solidarity rapidly grew to 10 million members — nearly a quarter of Poland's population — making it impossible to ignore.",
          "Significance: first independent trade union in a communist state to be legally recognised.",
          "Repression and legacy: martial law imposed December 1981, but Solidarity survived underground; by 1989 it won free elections, contributing to communism's collapse."
        ],
        solution: "Solidarity challenged communist authority by organising mass worker resistance; grew to 10 million, survived repression, and helped end communism by 1989.",
        commonErrors: [
          "Placing Solidarity in East Germany rather than Poland.",
          "Not mentioning Lech Wałęsa as leader.",
          "Not explaining that Solidarity's significance was its independence from the communist party — other unions existed but were state-controlled."
        ]
      },
      {
        question: "Analyse how the United Democratic Front (UDF) made South Africa 'ungovernable' in the 1980s.",
        steps: [
          "UDF established 1983: united over 400 anti-apartheid organisations to resist P.W. Botha's tricameral parliament (which excluded Black South Africans).",
          "Strategy 1: consumer boycotts — boycotting white-owned businesses reduced revenue and pressured businesses to oppose apartheid.",
          "Strategy 2: township stayaways — mass work stoppages disrupted the economy.",
          "Strategy 3: civic structures — UDF created parallel governance in townships, undermining government structures.",
          "Government response: State of Emergency (1985, 1986) — mass detentions, media restrictions."
        ],
        solution: "UDF made SA ungovernable through boycotts, stayaways and parallel township governance — non-violent mass action that paralysed apartheid structures.",
        commonErrors: [
          "Confusing UDF (1983, anti-tricameral parliament) with the ANC (formed 1912, exiled 1960-1990).",
          "Not identifying specific tactics — 'protest' is too vague; name boycotts, stayaways, civic structures.",
          "Not mentioning the government's response (State of Emergency)."
        ]
      },
      {
        question: "Explain the significance of the US civil rights movement (1955-1965) for international human rights struggles.",
        steps: [
          "Key events: Montgomery Bus Boycott (1955), Little Rock crisis (1957), March on Washington (1963), Civil Rights Act (1964), Voting Rights Act (1965).",
          "Significance for SA: anti-apartheid activists drew inspiration from non-violent resistance and civil disobedience; parallels between segregation and apartheid were explicit.",
          "Significance for the Global South: demonstrated that mass non-violent action could win legislative change against entrenched discrimination.",
          "International pressure: US civil rights abuses undermined US Cold War credibility — pushing government to act."
        ],
        solution: "US civil rights movement modelled non-violent mass action for global human rights movements; directly inspired anti-apartheid activists; linked to Cold War ideological competition.",
        commonErrors: [
          "Not knowing key dates/events — Montgomery (1955), March on Washington (1963), Civil Rights Act (1964).",
          "Treating the US movement as entirely separate from global contexts — the Cold War link is important.",
          "Not explaining international influence — the question asks for global significance, not just US domestic impact."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik hoe die Solidariteits-vakbond in Pole (1980) kommunistiese gesag uitgedaag het.",
        steps: [
          "Oorsprong: 1980 — werkers by Gdańsk-skeepwerwe het gestake, gelei deur Lech Wałęsa.",
          "Uitdaging: Solidariteit het vinnig tot 10 miljoen lede gegroei.",
          "Betekenis: eerste onafhanklike vakbond in 'n kommunistiese staat om wetlik erkend te word.",
          "Onderdrukking en erfenis: Krygswet Desember 1981, maar Solidariteit het ondergronds oorleef."
        ],
        solution: "Solidariteit het kommunistiese gesag uitgedaag deur massa-werkersweerstand te organiseer; het tot 10 miljoen gegroei en tot kommunisme se ineenstorting bygedra.",
        commonErrors: [
          "Solidariteit in Oos-Duitsland in plaas van Pole plaas.",
          "Nie Lech Wałęsa as leier noem nie.",
          "Nie verduidelik dat Solidariteit se betekenis sy onafhanklikheid van die kommunistiese party was nie."
        ]
      },
      {
        question: "Ontleed hoe die UDF Suid-Afrika 'onregeerbaar' gemaak het in die 1980s.",
        steps: [
          "UDF gestig 1983: meer as 400 anti-apartheidorganisasies verenig.",
          "Strategie 1: verbruikersboikotte — witbesit-besighede geboikot.",
          "Strategie 2: township-wegbly-aksies — massa-werksonderbrekings het die ekonomie ontwrig.",
          "Strategie 3: burgerlike strukture — die UDF het parallel bestuur in townships geskep.",
          "Regeringsreaksie: Noodtoestand (1985, 1986)."
        ],
        solution: "UDF het SA onregeerbaar gemaak deur boikotte, wegbly-aksies en parallel township-bestuur.",
        commonErrors: [
          "UDF (1983, anti-trikamerale parlement) met die ANC (1912, verban 1960-1990) verwar.",
          "Nie spesifieke taktieke identifiseer nie.",
          "Nie die staatsreaksie (Noodtoestand) noem nie."
        ]
      },
      {
        question: "Verduidelik die betekenis van die VSA-burgerregte-beweging (1955-1965) vir internasionale menseregte-stryd.",
        steps: [
          "Sleutelgebeurtenisse: Montgomery-busboikot (1955), Mars op Washington (1963), Burgerregtewet (1964).",
          "Betekenis vir SA: anti-apartheidsaktiviste het inspirasie uit nie-gewelddadige weerstand geput.",
          "Betekenis vir die Globale Suide: getoon dat massa-nie-gewelddadige aksie wetgewingsverandering kan wen.",
          "Internasionale druk: VSA-menseregte-oortredings het VSA se Koue Oorlog-geloofwaardigheid ondermyn."
        ],
        solution: "VSA-burgerregte-beweging het nie-gewelddadige massa-aksie vir globale bewegings modelleer; direk anti-apartheids-aktiviste geïnspireer.",
        commonErrors: [
          "Nie sleuteldatums/gebeure ken nie.",
          "Die VSA-beweging as heeltemal apart van globale kontekste behandel.",
          "Nie internasionale invloed verduidelik nie."
        ]
      }
    ]
  },

  "HIS-3": {
    workedExamplesEn: [
      {
        question: "Explain Mikhail Gorbachev's policies of glasnost and perestroika and how they contributed to the collapse of the USSR.",
        steps: [
          "Glasnost (openness): Gorbachev permitted greater freedom of expression, press criticism of government, and acknowledgement of Soviet problems.",
          "Perestroika (restructuring): attempted to reform the Soviet economic system by introducing limited market mechanisms and reducing central planning.",
          "Unintended consequences: glasnost allowed suppressed nationalist movements to speak out; perestroika disrupted the existing economy without building a functional new one.",
          "Collapse: emboldened Soviet republics declared independence; Communist Party lost legitimacy; December 1991 — USSR formally dissolved."
        ],
        solution: "Glasnost (openness) + perestroika (restructuring) → unintended release of nationalist forces + economic disruption → USSR dissolved December 1991.",
        commonErrors: [
          "Treating glasnost and perestroika as synonymous — they targeted different problems (political vs economic).",
          "Saying Gorbachev intended to dissolve the USSR — he wanted to reform it; dissolution was unintended.",
          "Not mentioning the role of nationalist movements in the republics."
        ]
      },
      {
        question: "Describe the events of 9 November 1989 (fall of the Berlin Wall) and explain its historical significance.",
        steps: [
          "Events: East German authorities announced, due to a miscommunication, that travel restrictions would be lifted 'immediately'. Crowds gathered at checkpoints; guards stood down; people began crossing freely.",
          "Crowds dismantled sections of the wall with hammers and pickaxes.",
          "Significance 1: symbolic end of the Iron Curtain — the physical barrier of the Cold War's division was destroyed.",
          "Significance 2: opened the path to German reunification (October 1990) and accelerated Eastern European democratisation."
        ],
        solution: "Berlin Wall fell 9 November 1989 due to miscommunication + popular pressure. Significance: end of Cold War's physical symbol + German reunification + Eastern European democratisation.",
        commonErrors: [
          "Saying the Wall was planned to fall — it fell due to a bureaucratic miscommunication and popular pressure.",
          "Not knowing the date (9 November 1989) — this is a key factual requirement.",
          "Not discussing post-Wall consequences (German reunification)."
        ]
      },
      {
        question: "Evaluate whether the end of communism in Eastern Europe was primarily caused by internal pressures or external factors.",
        steps: [
          "Internal pressures: economic stagnation (shortages, inefficiency); rising dissent and civil society movements (Solidarity, Civic Forum); loss of Communist Party legitimacy.",
          "External factors: Gorbachev's refusal to use Soviet military force to suppress dissent (unlike 1956 Hungary, 1968 Czechoslovakia); Western ideological and economic pressure.",
          "Evaluation: both contributed — internal discontent created the demand for change; external factors (Gorbachev's hands-off policy) removed the key barrier (Soviet military intervention)."
        ],
        solution: "Both internal (economic failure + civil movements) and external (Gorbachev's non-intervention) factors caused communism's collapse. Neither alone is sufficient.",
        commonErrors: [
          "Attributing collapse to only one cause — historians emphasise the interplay of both.",
          "Not mentioning Gorbachev's 'Sinatra Doctrine' (Soviet republics could go their own way) as a key external factor.",
          "Treating the collapse as inevitable — at any point, military repression could have delayed it."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik Mikhail Gorbatsjof se beleide van glasnost en perestroika en hoe hulle tot die ineenstorting van die USSR bygedra het.",
        steps: [
          "Glasnost (openheid): Gorbatsjof het groter vryheid van uitdrukking, persekritiek en erkenning van Sowjet-probleme toegelaat.",
          "Perestroika (herstrukturering): probeer om die Sowjet-ekonomiese stelsel te hervorm.",
          "Onbedoelde gevolge: glasnost het onderdrukte nasionalistiese bewegings laat praat; perestroika het die bestaande ekonomie ontwrig.",
          "Ineenstorting: Sowjet-republieke het onafhanklikheid verklaar; Desember 1991 — USSR formeel ontbind."
        ],
        solution: "Glasnost + perestroika → onbedoelde vrylating van nasionalistiese kragte + ekonomiese ontwrigting → USSR ontbind Desember 1991.",
        commonErrors: [
          "Glasnost en perestroika as sinonieme behandel.",
          "Sê Gorbatsjof het bedoel om die USSR te ontbind.",
          "Nie die rol van nasionalistiese bewegings noem nie."
        ]
      },
      {
        question: "Beskryf die gebeure van 9 November 1989 (val van die Berlynse Muur) en verduidelik die historiese betekenis.",
        steps: [
          "Gebeure: Oos-Duitse owerhede het, as gevolg van 'n wankommunikasie, aangekondig reisbeperkings word 'onmiddellik' opgehef.",
          "Menigtes het by kontrolepunte vergader; wagters het teruggestaan; mense het vrylik begin oorsteek.",
          "Menigtes het dele van die muur met hamers afgebreek.",
          "Betekenis 1: Simboliese einde van die Ystergordyn.",
          "Betekenis 2: Oopgemaak vir Duitse hereniging (Oktober 1990) en Oos-Europese demokratisering."
        ],
        solution: "Berlynse Muur val 9 November 1989. Betekenis: Koue Oorlog se fisiese simbool beëindig + Duitse hereniging + demokratisering.",
        commonErrors: [
          "Sê die Muur is beplan om te val.",
          "Nie die datum ken nie.",
          "Nie post-Muur gevolge bespreek nie."
        ]
      },
      {
        question: "Evalueer of die einde van kommunisme in Oos-Europa hoofsaaklik deur interne druk of eksterne faktore veroorsaak is.",
        steps: [
          "Interne druk: ekonomiese stagnasie; stygende onenigheid (Solidariteit); verlies van legitimiteit.",
          "Eksterne faktore: Gorbatsjof se weiering om Sowjet-militêre mag te gebruik; Westerse druk.",
          "Evaluering: beide het bygedra — interne ontevredenheid het die vraag na verandering geskep; Gorbatsjof se hande-af-beleid het die sleutelversperring verwyder."
        ],
        solution: "Beide interne (ekonomiese mislukking + burgerlike bewegings) en eksterne faktore (Gorbatsjof se nie-inmenging) het kommunisme se ineenstorting veroorsaak.",
        commonErrors: [
          "Ineenstorting aan slegs een oorsaak toeskryf.",
          "Nie Gorbatsjof se 'Sinatra-doktrine' noem nie.",
          "Die ineenstorting as onvermydelik behandel."
        ]
      }
    ]
  },

  "HIS-4": {
    workedExamplesEn: [
      {
        question: "Explain how transnational corporations (TNCs) drive globalisation and evaluate their impact on developing countries.",
        steps: [
          "TNCs: companies operating in multiple countries — shift production to lowest-cost locations.",
          "How they drive globalisation: create cross-border production chains; standardise products and brands globally; transfer technology.",
          "Positive impact on developing countries: FDI, job creation, technology transfer, access to global markets.",
          "Negative impact: repatriation of profits (wealth leaves), environmental exploitation, suppression of local competition, 'race to the bottom' on wages and standards."
        ],
        solution: "TNCs drive globalisation through cross-border production and standardisation. Benefits for developing countries (jobs, FDI) offset by profit repatriation and environmental costs.",
        commonErrors: [
          "Only listing positives or only listing negatives — evaluation requires both sides.",
          "Not giving a specific example of a TNC (Apple, Nike, McDonald's) — examples ground abstract analysis.",
          "Treating FDI as uniformly beneficial — the nature of investment matters (extractive vs productive)."
        ]
      },
      {
        question: "Distinguish between cultural globalisation and economic globalisation, with one example of each.",
        steps: [
          "Economic globalisation: integration of economies through trade, investment and finance — e.g. Apple iPhone manufactured across 200+ countries' supply chains.",
          "Cultural globalisation: spread of cultural products, ideas and values across borders — e.g. McDonald's in 100+ countries; global popularity of K-pop; American English as the global lingua franca.",
          "Tension: cultural globalisation raises concerns about homogenisation (loss of local culture) vs hybridisation (blending of cultures)."
        ],
        solution: "Economic globalisation (Apple supply chain) vs cultural globalisation (McDonald's, K-pop). Tension: homogenisation vs hybridisation.",
        commonErrors: [
          "Giving only economic examples for both — the question distinguishes the two types.",
          "Not addressing cultural concerns (homogenisation) — these are frequently tested.",
          "Treating globalisation as only Western-driven — K-pop, Nollywood, Bollywood are non-Western examples."
        ]
      },
      {
        question: "Explain the 'anti-globalisation movement' and describe two specific criticisms it raises.",
        steps: [
          "Anti-globalisation movement: a collection of NGOs, activist groups and trade unions opposing certain aspects of globalisation — notably at the WTO Seattle Summit (1999).",
          "Criticism 1: inequality — globalisation benefits wealthy countries and TNCs disproportionately; developing countries often remain trapped in low-value commodity exports.",
          "Criticism 2: environmental degradation — deregulated trade incentivises production in countries with weak environmental laws; climate costs are externalised."
        ],
        solution: "Anti-globalisation: Seattle 1999 as key moment. Criticisms: inequality (benefits flow upward) and environmental degradation (race to the bottom on standards).",
        commonErrors: [
          "Confusing anti-globalisation with anti-trade — the movement targets specific forms and governance of globalisation, not all trade.",
          "Not knowing the Seattle 1999 context.",
          "Not providing two specific criticisms (one is insufficient)."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik hoe transnasionale korporasies (TNK's) globalisering dryf en evalueer hul impak op ontwikkelende lande.",
        steps: [
          "TNK's: maatskappye wat in meerdere lande bedryf — verskuif produksie na goedkoopste liggings.",
          "Hoe hulle globalisering dryf: skep grensoorskrydende produksiekettings; standaardiseer produkte.",
          "Positiewe impak op ontwikkelende lande: BDB, werkskepping, tegnologie-oordrag.",
          "Negatiewe impak: wins-repatriëring, omgewingsontginning, plaaslike mededinging onderdrukking."
        ],
        solution: "TNK's dryf globalisering deur grensoorskrydende produksie. Voordele (werksgeleenthede, BDB) word gebalanseer deur winsrepatriëring en omgewingskoste.",
        commonErrors: [
          "Slegs positiewe of slegs negatiewe impak lys.",
          "Nie 'n spesifieke voorbeeld van 'n TNK gee nie.",
          "BDB as eenvormig voordelig behandel."
        ]
      },
      {
        question: "Onderskei tussen kulturele globalisering en ekonomiese globalisering, met een voorbeeld van elk.",
        steps: [
          "Ekonomiese globalisering: integrasie van ekonomieë deur handel en belegging — bv. Apple-iPhone wat in 200+ lande se voorsieningskettings vervaardig word.",
          "Kulturele globalisering: verspreiding van kulturele produkte oor grense — bv. McDonald's in 100+ lande; K-pop se wêreldgewildheid.",
          "Spanning: kulturele globalisering wek bekommernis oor homogenisering vs hibridisering."
        ],
        solution: "Ekonomiese globalisering (Apple) vs kulturele globalisering (McDonald's, K-pop). Spanning: homogenisering vs hibridisering.",
        commonErrors: [
          "Slegs ekonomiese voorbeelde vir albei gee.",
          "Kulturele bekommernisse nie bespreek nie.",
          "Globalisering as slegs Westers behandel."
        ]
      },
      {
        question: "Verduidelik die 'anti-globaliseringsbeweging' en beskryf twee spesifieke kritieke wat dit opper.",
        steps: [
          "Anti-globaliseringsbeweging: 'n versameling NGO's, aktiviste-groepe en vakbonde wat teen sekere aspekte van globalisering gekant is — veral by die WHO Seattle-beraad (1999).",
          "Kritiek 1: ongelykheid — globalisering bevoordeel ryk lande en TNK's buitensporig.",
          "Kritiek 2: omgewingsverval — dereguleerde handel moedig produksie aan in lande met swak omgewingswette."
        ],
        solution: "Anti-globalisering: Seattle 1999 as sleutelmoment. Kritieke: ongelykheid en omgewingsverval.",
        commonErrors: [
          "Anti-globalisering met anti-handel verwar.",
          "Die Seattle 1999-konteks nie ken nie.",
          "Nie twee spesifieke kritieke gee nie."
        ]
      }
    ]
  },

  "HIS-5": {
    workedExamplesEn: [
      {
        question: "Explain how Belgian colonial rule contributed to the Rwandan genocide (1994).",
        steps: [
          "Pre-colonial Rwanda: Hutu, Tutsi and Twa were social/occupational categories that were relatively fluid and interchangeable.",
          "Belgian policy: Belgian colonists used the Hamitic hypothesis to racialise these categories — Tutsi were deemed superior (taller, lighter features) and given administrative positions.",
          "Identity cards (1933): Belgians introduced ethnic identity cards permanently labelling all Rwandans as Hutu, Tutsi or Twa — transforming a fluid social distinction into a fixed racial identity.",
          "Post-independence: entrenched ethnic hierarchy fuelled resentment; power shifted to Hutu majority in 1962; the binary identity system persisted as a political weapon.",
          "Genocide trigger: Habyarimana's assassination (April 1994) → Hutu extremists used radio (Radio Mille Collines) to organise the murder of Tutsi — 800 000 killed in 100 days."
        ],
        solution: "Belgian colonialism racialised fluid Hutu/Tutsi categories via ID cards (1933) → entrenched ethnic hierarchy → post-independence Hutu resentment → extremism exploited the binary for genocide.",
        commonErrors: [
          "Treating Hutu and Tutsi as always having been rigid ethnic groups — Belgium created this rigidity.",
          "Not knowing the date of the genocide (1994) or its scale (±800 000 killed).",
          "Ignoring the role of Radio Milles Collines (propaganda) in the actual killings."
        ]
      },
      {
        question: "Explain the 'Wind of Change' speech (Macmillan, 1960) and its significance for African decolonisation.",
        steps: [
          "Context: British Prime Minister Harold Macmillan addressed the South African Parliament in February 1960.",
          "Content: 'The wind of change is blowing through this continent…' — acknowledged that African nationalism was an unstoppable force; Britain would not resist decolonisation.",
          "Significance 1: signalled a shift in British policy — former colonies would be granted independence.",
          "Significance 2: challenged South Africa's apartheid — Macmillan explicitly stated his government did not support racial discrimination.",
          "Reception: applauded internationally; deeply uncomfortable for South Africa's Verwoerd government."
        ],
        solution: "Macmillan's 1960 speech acknowledged African nationalism's inevitability → accelerated British decolonisation + directly challenged apartheid.",
        commonErrors: [
          "Not knowing the date or speaker (Macmillan, 1960) — this is frequently tested.",
          "Not mentioning the South African context — the speech was delivered in Cape Town.",
          "Treating the speech as if it immediately ended colonialism — decolonisation was a process that continued into the 1980s (Zimbabwe 1980)."
        ]
      },
      {
        question: "Explain the structural adjustment programmes (SAPs) imposed on African countries and evaluate their impact.",
        steps: [
          "SAPs: economic reforms required by the IMF and World Bank as conditions for loans to indebted African countries in the 1980s-90s.",
          "Key requirements: privatise state companies; cut government spending; remove trade barriers; devalue currency.",
          "Positive claimed outcomes: reduced government deficits; improved trade competitiveness.",
          "Negative actual outcomes: cuts to health and education devastated human development; privatisation often led to job losses; removal of tariffs exposed local industries to foreign competition they could not match."
        ],
        solution: "SAPs = IMF/World Bank loan conditions (privatise, cut spending, liberalise). Positive claimed fiscal effects offset by devastating social costs (health, education, unemployment).",
        commonErrors: [
          "Treating SAPs as purely beneficial — the dominant historical assessment is highly critical due to social costs.",
          "Not explaining the mechanism (how each requirement actually operated in practice).",
          "Confusing SAPs with colonialism — SAPs were post-independence economic conditions, not direct colonial rule."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik hoe Belgiese koloniale bewind tot die Rwandese volksmoord (1994) bygedra het.",
        steps: [
          "Pre-koloniale Rwanda: Hutu, Tutsi en Twa was relatief vloeiende sosiale/beroepskategorieë.",
          "Belgiese beleid: Belgiese koloniste het die Hamitiese hipotese gebruik om hierdie kategorieë te rassialiseer.",
          "Identiteitskaarte (1933): permanent alle Rwandese as Hutu, Tutsi of Twa gemerk.",
          "Na onafhanklikheid: etniese hiërargie het wrok aangeblaas; mag het na Hutu-meerderheid in 1962 verskuif.",
          "Volksmoord-sneller: Habyarimana se moord (April 1994) → Hutu-ekstremiste gebruik radio om die moord van Tutsi te organiseer — 800 000 in 100 dae."
        ],
        solution: "Belgiese kolonialisme het vloeiende kategorieë gerassialiseer deur ID-kaarte → etniese hiërargie → Hutu-wrok → ekstremisme het volksmoord gepleeg.",
        commonErrors: [
          "Hutu en Tutsi as altyd rigiede etniese groepe behandel.",
          "Nie die datum (1994) of skaal (±800 000) ken nie.",
          "Die rol van Radio Mille Collines ignoreer."
        ]
      },
      {
        question: "Verduidelik die 'Wind van Verandering'-toespraak (Macmillan, 1960) en sy betekenis vir Afrika-dekolonisasie.",
        steps: [
          "Konteks: Britse Premier Harold Macmillan het die SA-Parlement in Februarie 1960 toegespreek.",
          "Inhoud: 'Die wind van verandering waai deur hierdie kontinent…' — erken Afrika-nasionalisme as 'n onstuitbare krag.",
          "Betekenis 1: Britse beleidsverskuiwing — voormalige kolonies sou onafhanklikheid kry.",
          "Betekenis 2: Uitdaging aan SA se apartheid — Macmillan het rasgediskriminasie verwerp.",
          "Ontvangs: internasionaal toegejuig; ongemaklik vir Verwoerd-regering."
        ],
        solution: "Macmillan se 1960-toespraak het Afrika-nasionalisme se onvermydelikheid erken → versnelde Britse dekolonisasie + uitdaging aan apartheid.",
        commonErrors: [
          "Nie die datum of spreker (Macmillan, 1960) ken nie.",
          "Nie die SA-konteks noem nie.",
          "Die toespraak behandel asof dit kolonialisme onmiddellik beëindig het."
        ]
      },
      {
        question: "Verduidelik die strukturele aanpassingsprogramme (SAP) op Afrika opgelê en evalueer hul impak.",
        steps: [
          "SAP: ekonomiese hervormings deur IMF en Wêreldbank vereis as voorwaardes vir lenings.",
          "Sleutelvereistes: privatiseer; sny staatsbesteding; verwyder handelsbeperkings; devalueer geldeenheid.",
          "Beweerde positiewe uitkomste: verminderde begrotingstekort; verbeterde handelsmededingendheid.",
          "Werklike negatiewe uitkomste: gesondheid en opvoeding gesny het menslike ontwikkeling vernietig."
        ],
        solution: "SAP = IMF/Wêreldbank-leningsvoorwaardes. Positiewe begrotingseffekte word deur vernietigende sosiale koste geneutraliseer.",
        commonErrors: [
          "SAP as suiwer voordelig behandel.",
          "Nie die meganisme verduidelik nie.",
          "SAP met kolonialisme verwar."
        ]
      }
    ]
  },

  "HIS-6": {
    workedExamplesEn: [
      {
        question: "Explain the purpose of the TRC and evaluate whether it achieved justice for victims of apartheid.",
        steps: [
          "Purpose: established under the Promotion of National Unity and Reconciliation Act (1995), chaired by Archbishop Desmond Tutu; aimed to create a complete picture of apartheid's human rights abuses.",
          "Mechanism: perpetrators could apply for amnesty in exchange for full, truthful disclosure of politically motivated acts; victims could testify at public hearings.",
          "Did it achieve justice? For — gave victims a public platform; named perpetrators; created an official historical record.",
          "Against — only 1 500 amnesties granted; few prosecutions; reparations delayed and reduced from the TRC's recommendations."
        ],
        solution: "TRC: truth and acknowledgement achieved; retributive justice (prosecution) was largely absent; reparations inadequate. Reconciliation partial — victim communities remain divided.",
        commonErrors: [
          "Saying the TRC fully resolved apartheid's injustices — it addressed the historical record, not material redress.",
          "Not knowing that Desmond Tutu chaired it — a frequently tested fact.",
          "Treating amnesty as justice — critics argue amnesty protected perpetrators at the expense of victims."
        ]
      },
      {
        question: "Compare the concepts of restorative and retributive justice in the context of post-apartheid South Africa.",
        steps: [
          "Retributive justice: focuses on punishment proportional to the crime — perpetrators face trial, conviction and imprisonment.",
          "Restorative justice: focuses on repairing harm — perpetrators acknowledge wrongdoing; victims receive recognition; communities participate in healing.",
          "TRC's approach: restorative — truth in exchange for amnesty; victims testified; perpetrators rarely prosecuted.",
          "Debate: critics argue only retributive justice can honour the gravity of apartheid crimes; supporters argue restorative justice was necessary to prevent civil war and enable democratic transition."
        ],
        solution: "Retributive (punishment) vs restorative (healing/acknowledgement). TRC chose restorative to enable transition; critics argue this sacrificed justice for victims.",
        commonErrors: [
          "Describing only one type of justice without contrasting the two.",
          "Not connecting to the TRC — the question is grounded in SA history.",
          "Treating the debate as settled — it remains contested among historians and survivors."
        ]
      },
      {
        question: "Explain why South Africa chose the TRC model rather than prosecution-based justice (as in the Nuremberg Trials).",
        steps: [
          "Political context: ANC and NP negotiated a transitional settlement — neither had complete power; blanket prosecution of security forces was politically impossible.",
          "Risk of civil war: prosecuting thousands of security personnel risked security force resistance to the new democratic government.",
          "International model: the Nuremberg precedent existed but required victor's justice; SA was a negotiated settlement between two parties, not a military defeat.",
          "Compromise: amnesty-for-truth offered a path that ANC leadership believed would enable stable democratic transition."
        ],
        solution: "TRC chosen over Nuremberg model because: political balance of forces prevented blanket prosecution; risk of destabilisation; amnesty-for-truth was the negotiated compromise.",
        commonErrors: [
          "Not knowing that the TRC was a compromise between ANC and NP negotiators.",
          "Not understanding why military-style prosecution (Nuremberg) was inapplicable — SA was not a military defeat of the old regime.",
          "Treating the TRC choice as ideal — it was a pragmatic compromise with acknowledged costs."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die doel van die WVK en evalueer of dit geregtigheid vir apartheid-slagoffers bereik het.",
        steps: [
          "Doel: gestig onder die Wet op Bevordering van Nasionale Eenheid (1995); doel om 'n volledige prentjie van apartheid se menseregte-misbruike te skep.",
          "Meganisme: daders kon amnestie aanvra in ruil vir volle, eerlike openbaarmaking; slagoffers kon getuig.",
          "Het dit geregtigheid bereik? Pro — slagoffers 'n openbare platform; daders genoem; 'n amptelike historiese rekord.",
          "Teen — slegs 1 500 amnestie toegestaan; min vervolging; herstelbetalings vertraag en verminder."
        ],
        solution: "WVK: waarheid en erkenning bereik; vergeldende geregtigheid (vervolging) was grotendeels afwesig; herstelbetalings onvoldoende.",
        commonErrors: [
          "Sê die WVK het apartheid se ongeregtigheid volkome opgelos.",
          "Nie weet Desmond Tutu het dit voorgesi nie.",
          "Amnestie as geregtigheid behandel."
        ]
      },
      {
        question: "Vergelyk die konsepte van herstel- en vergeldende geregtigheid in die konteks van post-apartheid SA.",
        steps: [
          "Vergeldende geregtigheid: fokus op straf proporsioneel tot die misdaad.",
          "Herstellende geregtigheid: fokus op herstel van skade — daders erken wangedrag; slagoffers kry erkenning.",
          "WVK se benadering: herstellend — waarheid in ruil vir amnestie.",
          "Debat: kritici voer aan slegs vergeldende geregtigheid kan die erns van apartheid-misdade eer; ondersteuners voer aan herstellende geregtigheid was nodig om burgeroorlog te voorkom."
        ],
        solution: "Vergeldend (straf) vs herstellend (genesing/erkenning). WVK het herstellend gekies; kritici voer aan dit het geregtigheid vir slagoffers opgeoffer.",
        commonErrors: [
          "Slegs een tipe geregtigheid beskryf sonder die twee te kontrasteer.",
          "Nie aan die WVK koppel nie.",
          "Die debat as gesletheid behandel."
        ]
      },
      {
        question: "Verduidelik hoekom SA die WVK-model bo vervolgings-gebaseerde geregtigheid (soos Neurenberg) gekies het.",
        steps: [
          "Politieke konteks: ANC en NP het 'n oorgangsvergelyk onderhandel — geen party het volledige mag.",
          "Risiko van burgeroorlog: vervolging van duisende veiligheidspersoneel het stabiliteit bedreig.",
          "Internasionale model: Neurenberg-presedent het wenner-geregtigheid vereis; SA was 'n onderhandelde vergelyk.",
          "Kompromis: amnestie-vir-waarheid het 'n pad gebied vir demokratiese oorgang."
        ],
        solution: "WVK bo Neurenberg gekies omdat: politieke magsbalans massavervolging verhoed het; risiko van destabilisering; amnestie-vir-waarheid was die onderhandelde kompromis.",
        commonErrors: [
          "Nie weet die WVK 'n kompromis tussen ANC en NP was nie.",
          "Nie verstaan hoekom militêre vervolging (Neurenberg) nie toepasbaar was nie.",
          "Die WVK-keuse as ideaal behandel."
        ]
      }
    ]
  },

  // ===================== ENGLISH FIRST ADDITIONAL LANGUAGE (ENGF) =====================

  "ENGF-1": {
    workedExamplesEn: [
      {
        question: "Identify the theme of the prescribed novel and explain how it is developed through two characters.",
        steps: [
          "State the theme clearly (e.g. 'the cost of ambition', 'the resilience of the human spirit').",
          "Character 1: show how this character embodies or confronts the theme through specific events.",
          "Character 2: show how the theme is developed differently through the second character.",
          "Conclude: what does the novel ultimately say about this theme?"
        ],
        solution: "Theme: the destructive power of secrecy. Character 1 (protagonist): keeps a secret about her past that isolates her throughout the novel — her silence is a survival strategy that also imprisons her. Character 2 (antagonist): uses his knowledge of her secret as a weapon — demonstrating how secrets become tools of power. The novel concludes that secrets ultimately destroy the one who keeps them, while briefly empowering the one who knows them.",
        commonErrors: [
          "Naming a topic ('family') instead of a theme ('the way family loyalty can become a form of oppression').",
          "Discussing only one character when two are required.",
          "Not showing how the theme develops or evolves — themes are not static points."
        ]
      },
      {
        question: "Write a PEEL paragraph linking a character's decision to the novel's theme.",
        steps: [
          "Point: identify the character's decision and state how it connects to the theme.",
          "Evidence: quote or reference the specific moment of decision.",
          "Explain: show the consequence of the decision and how it develops the theme.",
          "Link: connect back to the question or thesis."
        ],
        solution: "Point: Maria's decision to return the stolen money, even at personal risk, embodies the novel's theme of moral courage over self-preservation. Evidence: In Chapter 9, the author describes her hands shaking as she pushes the envelope under the shop door — 'not to be seen, but to be right'. Explain: This act isolates her from her companions who benefited from the theft, but it restores her self-respect — demonstrating that moral choices have a higher cost than strategic ones. Link: The novel repeatedly shows that true courage is not the absence of fear but the willingness to act despite it.",
        commonErrors: [
          "Omitting the Explain step — evidence without analysis is description, not argument.",
          "Choosing a quote unrelated to the theme being discussed.",
          "Making the Link too general ('this shows courage in the novel') without specifying the novel's argument."
        ]
      },
      {
        question: "Analyse how the author's choice of setting contributes to the novel's mood.",
        steps: [
          "Identify the dominant setting (time, place, physical conditions).",
          "Describe specific details the author uses to create the setting.",
          "Explain what mood (atmosphere) these details create.",
          "Show where in the novel the mood is most powerfully created by the setting."
        ],
        solution: "The novel's dominant setting — a drought-stricken farming community — creates a pervasive mood of exhaustion and hopelessness. The author describes the cracked earth, dead livestock and empty water tanks repeatedly, particularly in Chapters 1 and 7. These details do not merely describe a place; they create a psychological state — the land's exhaustion mirrors the community's emotional depletion. The drought setting thus functions as an extended metaphor for the human crisis at the novel's centre.",
        commonErrors: [
          "Describing the setting without connecting it to mood.",
          "Using 'atmosphere' and 'mood' interchangeably without explanation.",
          "Not citing specific chapters or details — analysis must be grounded in the text."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Identifiseer die tema van die voorgeskrewe roman en verduidelik hoe dit deur twee karakters ontwikkel word.",
        steps: [
          "Stel die tema duidelik.",
          "Karakter 1: wys hoe hierdie karakter die tema beliggaam deur spesifieke gebeure.",
          "Karakter 2: wys hoe die tema anders deur die tweede karakter ontwikkel word.",
          "Gevolgtrekking: wat sê die roman uiteindelik oor die tema?"
        ],
        solution: "Tema: die vernietigende krag van geheimsinnigheid. Karakter 1 (protagonis): hou 'n geheim wat haar isoleer — stilte as oorlewingstrategie wat haar ook gevange hou. Karakter 2 (antagonis): gebruik kennis van haar geheim as 'n wapen — hoe geheime gereedskap van mag word. Die roman besluit geheime vernietig uiteindelik die houer terwyl hulle die kenner bemagtig.",
        commonErrors: [
          "'n Onderwerp noem ('familie') in plaas van 'n tema ('hoe familie-lojaliteit onderdrukking kan word').",
          "Slegs een karakter bespreek.",
          "Nie wys hoe die tema ontwikkel of verander nie."
        ]
      },
      {
        question: "Skryf 'n PEEL-paragraaf wat 'n karakter se besluit aan die roman se tema koppel.",
        steps: [
          "Punt: identifiseer die karakter se besluit en hoe dit aan die tema verbind.",
          "Bewys: haal aan of verwys na die spesifieke moment van besluit.",
          "Verduidelik: wys die gevolg van die besluit en hoe dit die tema ontwikkel.",
          "Skakel: verbind terug na die vraag of tesisstelling."
        ],
        solution: "Punt: Maria se besluit om die gesteelde geld terug te gee beliggaam die tema van morele moed bo selfbehoud. Bewys: Hoofstuk 9: haar hande bewe terwyl sy die koevert onder die winkeldeur skuif. Verduidelik: Dit isoleer haar van haar metgeselle maar herstel haar selfrespek. Skakel: Die roman toon dat ware moed nie die afwesigheid van vrees is nie maar die bereidheid om ten spyte daarvan op te tree.",
        commonErrors: [
          "Die Verduidelik-stap weglaat.",
          "'n Aanhaling kies wat nie verband hou met die tema nie.",
          "Die Skakel te algemeen maak."
        ]
      },
      {
        question: "Ontleed hoe die outeur se keuse van ruimte bydra tot die roman se stemming.",
        steps: [
          "Identifiseer die dominante ruimte.",
          "Beskryf spesifieke besonderhede wat die outeur gebruik om die ruimte te skep.",
          "Verduidelik watter stemming hierdie besonderhede skep.",
          "Wys waar in die roman die stemming kragtigste deur die ruimte geskep word."
        ],
        solution: "Die roman se dominante ruimte — 'n droogte-geteisterde boerdery-gemeenskap — skep 'n deurdringende stemming van uitputting. Die outeur beskryf gebreekte grond, dooie vee en leë watertenks herhaaldelik. Hierdie besonderhede skep 'n sielkundige toestand — die land se uitputting weerspieël die gemeenskap se emosionele verering. Die droogte funksioneer dus as 'n uitgebreide metafoor.",
        commonErrors: [
          "Die ruimte beskryf sonder om dit aan stemming te koppel.",
          "'Atmosfeer' en 'stemming' afwisselend gebruik sonder verduideliking.",
          "Nie spesifieke hoofstukke of besonderhede aanhaal nie."
        ]
      }
    ]
  },

  "ENGF-2": {
    workedExamplesEn: [
      {
        question: "Explain how stage directions create meaning in a dramatic extract.",
        steps: [
          "Quote a specific stage direction.",
          "Describe the physical action or atmosphere it indicates.",
          "Explain what this reveals about character, relationship, power, or theme.",
          "Show what would be lost without the direction."
        ],
        solution: "'[She closes the door slowly and does not look back.]' Physical action: slow closure = reluctance; no backward glance = resolve or disconnection. This reveals the character has made a final decision — she is moving forward despite her pain. The slowness suggests she is not fully free of the relationship; the avoidance of looking back shows she fears weakening her resolve. Without this direction, her exit could be read as either indifference or confidence — the stage direction removes ambiguity and reveals suppressed grief.",
        commonErrors: [
          "Describing the stage direction without analysing its emotional or thematic significance.",
          "Not quoting the direction exactly.",
          "Treating all stage directions as equally important — focus on those that carry the most interpretive weight."
        ]
      },
      {
        question: "Explain what dramatic irony is and identify one example from the prescribed play.",
        steps: [
          "Define dramatic irony: audience knows something that a character does not.",
          "Identify the specific information gap.",
          "Quote or reference the moment where the character speaks without awareness.",
          "Explain the effect on the audience."
        ],
        solution: "Dramatic irony: the audience knows information that the character does not. In Act 2, the audience knows the letter has been intercepted, but Portia speaks confidently about her plan succeeding — 'By this time, he has the answer'. The audience watches her build hope on a false premise. The effect is agonising — we want to warn her but cannot; it intensifies our emotional investment and deepens the tragic inevitability.",
        commonErrors: [
          "Confusing dramatic irony with situational irony — dramatic irony requires the audience to be in on the secret.",
          "Not specifying what information the character lacks.",
          "Identifying the irony without explaining its effect on the audience."
        ]
      },
      {
        question: "Analyse the function of conflict in the prescribed play, distinguishing between inner and outer conflict.",
        steps: [
          "Define inner conflict: character vs self (divided loyalties, guilt, ambition).",
          "Define outer conflict: character vs another character or force.",
          "Identify one example of each in the play.",
          "Show how the two types of conflict intersect at a key moment."
        ],
        solution: "Inner conflict: the protagonist is torn between loyalty to her father and love for her enemy — '[she paces, picking up the letter, setting it down]' in Act 1 Scene 3. Outer conflict: her brother's direct accusation in Act 2. The intersection: when the outer conflict forces her to choose openly, it crystallises the inner conflict — she must name which loyalty is primary. The playwright uses the outer conflict to make the inner one visible and undeniable.",
        commonErrors: [
          "Describing only outer conflict (visible drama) and ignoring inner conflict (psychology).",
          "Not showing how they intersect.",
          "Treating inner conflict as a character flaw rather than a structural device."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik hoe toneelaanwysings betekenis in 'n dramatiese uittreksel skep.",
        steps: [
          "Haal 'n spesifieke toneelaanwysing aan.",
          "Beskryf die fisiese aksie of atmosfeer.",
          "Verduidelik wat dit onthul oor karakter, verhouding, mag of tema.",
          "Wys wat verlore sou gaan sonder die aanwysing."
        ],
        solution: "'[Sy maak die deur stadig toe en kyk nie terug nie.]' Fisiese aksie: stadige sluiting = teensin; geen agteruitkyk = besluit. Dit onthul die karakter het 'n finale besluit geneem. Die stadigheid dui aan sy is nie volkome vry van die verhouding nie. Sonder hierdie aanwysing kon haar vertrek as óf onverskilligheid óf selfvertroue gelees word.",
        commonErrors: [
          "Die toneelaanwysing beskryf sonder die emosionele betekenis te ontleed.",
          "Nie die aanwysing presies aanhaal nie.",
          "Alle toneelaanwysings as ewe belangrik behandel."
        ]
      },
      {
        question: "Verduidelik wat dramatiese ironie is en identifiseer een voorbeeld uit die voorgeskrewe drama.",
        steps: [
          "Definieer dramatiese ironie: die gehoor weet iets wat 'n karakter nie weet nie.",
          "Identifiseer die spesifieke kennisgaping.",
          "Haal aan of verwys na die moment.",
          "Verduidelik die effek op die gehoor."
        ],
        solution: "Dramatiese ironie: die gehoor weet die brief is onderskep, maar Portia praat vertrouelik. Die effek is kwellend — ons wil haar waarsku maar kan nie; dit verskerp emosionele betrokkenheid.",
        commonErrors: [
          "Dramatiese ironie met situasionele ironie verwar.",
          "Nie spesifiseer watter inligting die karakter ontbreek nie.",
          "Die ironie identifiseer sonder die effek te verduidelik."
        ]
      },
      {
        question: "Ontleed die funksie van konflik in die voorgeskrewe drama, met onderskeid tussen innerlike en uiterlike konflik.",
        steps: [
          "Definieer innerlike konflik en uiterlike konflik.",
          "Identifiseer een voorbeeld van elk in die drama.",
          "Wys hoe die twee tipes konflik by 'n sleutelmoment kruis."
        ],
        solution: "Innerlike konflik: protagonis is geskeur tussen lojaliteit aan haar vader en liefde vir haar vyand. Uiterlike konflik: haar broer se direkte aanklag in Bedryf 2. Kruising: wanneer die uiterlike konflik haar dwing om openlik te kies, kristalliseer dit die innerlike — sy moet benoem watter lojaliteit primêr is.",
        commonErrors: [
          "Slegs uiterlike konflik beskryf.",
          "Nie wys hoe hulle kruis nie.",
          "Innerlike konflik as 'n karakterfout behandel."
        ]
      }
    ]
  },

  "ENGF-3": {
    workedExamplesEn: [
      {
        question: "Identify the speaker and tone of a poem, and explain how word choice establishes the tone.",
        steps: [
          "Identify the speaker: is it a specific character, an abstract 'I', or an omniscient voice?",
          "Identify the tone: what is the speaker's emotional attitude toward the subject?",
          "Find 2-3 specific words that create this tone.",
          "Explain how each word contributes to the overall tonal effect."
        ],
        solution: "Speaker: a grieving parent speaking to a deceased child. Tone: quietly devastated. Word choice: 'hollow' (l.2) suggests the emptiness of life after loss — not dramatic grief but an internal vacuum. 'Still' (l.6) is ambiguous: the child is physically still (dead) but also the speaker is commanded to remain still (suppressed grief). 'Borrowed light' (l.10) implies the speaker lived through the child, not independently — their own light was contingent. Together, these words create a tone of profound but controlled grief.",
        commonErrors: [
          "Describing the topic ('the poem is about death') instead of the tone ('the speaker feels...').",
          "Choosing obvious emotional words ('sad', 'happy') rather than specific, nuanced word choices.",
          "Not explaining how each word creates the tone — listing words without analysis."
        ]
      },
      {
        question: "Identify and explain the effect of a simile and a metaphor in the poem.",
        steps: [
          "Simile: identify the comparison using 'like' or 'as'; explain what two things are compared.",
          "Explain the simile's effect: what does the comparison add to meaning?",
          "Metaphor: identify the direct comparison (without 'like' or 'as').",
          "Explain the metaphor's effect."
        ],
        solution: "Simile: 'Her words fell like autumn leaves' (l.4) — words are compared to autumn leaves: both are small, light, drifting, and associated with dying. Effect: her speech is gentle and melancholic, without force — the simile captures both the beauty and the futility of her communication. Metaphor: 'His silence was a wall' (l.9) — silence becomes a physical barrier. Effect: the metaphor gives absence a physical, architectural presence — silence is not just passive but actively excluding, creating distance between them.",
        commonErrors: [
          "Identifying the figure of speech without explaining what is being compared.",
          "Explaining the comparison without discussing its effect (what it adds to meaning).",
          "Confusing simile ('like'/'as') and metaphor (direct comparison)."
        ]
      },
      {
        question: "Explain how the structure of a poem (stanzas, line length, punctuation) contributes to meaning.",
        steps: [
          "Count stanzas and note their length — equal stanzas suggest order; irregular suggest disorder.",
          "Note line length — short lines create speed or abruptness; long lines slow and elaborate.",
          "Note punctuation — enjambment (no stop at line end) creates flow; full stops create breaks; exclamation marks signal intensity.",
          "Connect structural features to the poem's emotional content."
        ],
        solution: "The poem has four regular quatrains followed by an irregular final couplet. The regular stanzas represent the speaker's attempt to impose control on grief; the final irregular couplet breaks the pattern — suggesting the speaker's emotional control finally fails. Enjambment across lines 3-4 of each stanza mimics the way grief overflows its containment. The single exclamation mark in line 14 is the only moment of released emotion — its rarity makes it explosive.",
        commonErrors: [
          "Describing structural features without connecting them to meaning.",
          "Treating all punctuation as equally significant — focus on where it is unexpected or unusual.",
          "Not discussing enjambment, which is one of the most meaningful structural choices in poetry."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Identifiseer die spreker en toon van 'n gedig en verduidelik hoe woordkeuse die toon vestig.",
        steps: [
          "Identifiseer die spreker.",
          "Identifiseer die toon.",
          "Vind 2-3 spesifieke woorde wat hierdie toon skep.",
          "Verduidelik hoe elke woord tot die algehele toon bydra."
        ],
        solution: "Spreker: 'n treurende ouer wat met 'n oorlede kind praat. Toon: stille verwoesting. Woordkeuse: 'leeg' (r.2) dui op die vakuum van lewe na verlies. 'Stil' (r.6) is dubbelsinnig: fisies stil (dood) of bevel om stil te bly. 'Geeleende lig' (r.10) impliseer die spreker het deur die kind gelewe. Saam skep hierdie woorde 'n toon van diep maar beheerste droefheid.",
        commonErrors: [
          "Die onderwerp beskryf in plaas van die toon.",
          "Opsigtelike emosionele woorde kies eerder as spesifieke, genuanseerde woordkeuses.",
          "Woorde lys sonder ontleding."
        ]
      },
      {
        question: "Identifiseer en verduidelik die effek van 'n vergelyking en 'n metafoor in die gedig.",
        steps: [
          "Vergelyking: identifiseer die vergelyking met 'soos' of 'as'.",
          "Verduidelik die effek van die vergelyking.",
          "Metafoor: identifiseer die direkte vergelyking (sonder 'soos' of 'as').",
          "Verduidelik die effek van die metafoor."
        ],
        solution: "Vergelyking: 'Haar woorde het soos herfsblare geval' (r.4) — woorde word met herfsblare vergelyk: albei klein, lig, drywend. Effek: haar toespraak is sag en melankolies. Metafoor: 'Sy stilte was 'n muur' (r.9) — stilte word 'n fisiese versperring. Effek: gee afwesigheid 'n fisiese teenwoordigheid.",
        commonErrors: [
          "Die figuur identifiseer sonder te verduidelik wat vergelyk word.",
          "Die vergelyking verduidelik sonder die effek te bespreek.",
          "Vergelyking ('soos'/'as') en metafoor (direkte vergelyking) verwar."
        ]
      },
      {
        question: "Verduidelik hoe die struktuur van 'n gedig (strofes, reëllengte, leestekens) tot betekenis bydra.",
        steps: [
          "Tel strofes en let op die lengte.",
          "Let op reëllengte.",
          "Let op leestekens — enjambement skep vloei; punte skep pouses.",
          "Koppel strukturele kenmerke aan die gedig se emosionele inhoud."
        ],
        solution: "Die gedig het vier reëlmatige kwatraine gevolg deur 'n onreëlmatige finale koeplet. Reëlmatige strofes weerspieël die spreker se poging om beheer te handhaaf; die finale koeplet breek die patroon. Enjambement oor reëls 3-4 mim hoe droefheid oorloop. Die enkele uitroepteken in reël 14 is die enigste moment van vrygestelde emosie.",
        commonErrors: [
          "Strukturele kenmerke beskryf sonder om hulle aan betekenis te koppel.",
          "Alle leestekens as ewe belangrik behandel.",
          "Enjambement nie bespreek nie."
        ]
      }
    ]
  },

  "ENGF-4": {
    workedExamplesEn: [
      {
        question: "Explain how the ending of a short story achieves its effect.",
        steps: [
          "Identify the type of ending: twist/surprise, reflective, ambiguous, circular, or open.",
          "Describe what happens in the final paragraph.",
          "Explain how this ending creates the dominant effect.",
          "Show how earlier story elements prepared for (or subverted) this ending."
        ],
        solution: "Ending type: ambiguous. Final paragraph: the protagonist drives away, leaving his suitcase on the doorstep. Effect: the reader cannot determine whether he has changed his mind about leaving or simply forgotten the case — the story ends in suspension, refusing to resolve the central question. Earlier preparation: the story repeatedly presents the protagonist as indecisive, and the forgotten suitcase has appeared twice before as a symbol of his inability to commit. The ending is satisfying precisely because it is unresolved — it respects the character's ambiguity.",
        commonErrors: [
          "Summarising the ending rather than analysing its effect.",
          "Treating an ambiguous ending as a weakness ('the story doesn't finish') rather than a deliberate technique.",
          "Not connecting the ending to earlier story elements."
        ]
      },
      {
        question: "Discuss the role of setting in creating atmosphere in a short story extract.",
        steps: [
          "Identify the setting (time, place, weather, physical conditions).",
          "Quote two specific descriptive details.",
          "Explain the atmosphere these details create.",
          "Show how the atmosphere affects the reader's experience of the events."
        ],
        solution: "Setting: an abandoned industrial building at night in winter. Detail 1: 'the pipes groaned like something alive but not living' — personification creates uncanny life in a dead space. Detail 2: 'the floor was slick with something the flashlight couldn't name' — deliberate vagueness creates dread. Atmosphere: claustrophobic, threatening, uncanny. Effect: the reader experiences each event with heightened anxiety — the setting functions as an amplifier of the characters' fear, making mundane events (finding a door, hearing a sound) feel threatening.",
        commonErrors: [
          "Describing the setting without connecting it to atmosphere.",
          "Treating atmosphere as a synonym for mood without explaining how setting creates it.",
          "Not quoting specific details — analysis must be grounded in the text."
        ]
      },
      {
        question: "Identify the central conflict of a short story and explain how it drives the plot.",
        steps: [
          "Name the conflict type: person vs person, person vs self, person vs society, person vs nature.",
          "Describe the conflict specifically.",
          "Show how the conflict creates the story's central tension.",
          "Explain how the conflict is resolved or left unresolved at the end."
        ],
        solution: "Conflict type: person vs self (inner conflict). Specific conflict: the protagonist must decide whether to testify against a corrupt official who threatened her family or remain silent to keep her children safe. Central tension: every scene builds toward her choice — the reader is positioned to want her to testify but to understand why she cannot. Resolution: she testifies, but the story's final line ('she drove home knowing she'd done the right thing, wondering if she'd done the smart one') refuses to celebrate the choice, leaving the moral weight unresolved.",
        commonErrors: [
          "Identifying a conflict type without explaining the specific conflict.",
          "Confusing the central conflict with a subplot.",
          "Not showing how the conflict drives the plot — it must be the engine of events."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik hoe die einde van 'n kortverhaal sy effek bereik.",
        steps: [
          "Identifiseer die tipe einde: verrassend, reflektief, dubbelsinnig, sirkelvormig of oop.",
          "Beskryf wat in die finale paragraaf gebeur.",
          "Verduidelik hoe hierdie einde die dominante effek skep.",
          "Wys hoe vroeëre verhaalelemente vir hierdie einde voorberei (of dit ondermyn) het."
        ],
        solution: "Eindtipe: dubbelsinnig. Die protagonis ry weg en laat sy koffer op die stoep. Die leser kan nie bepaal of hy van gedagte verander het of die koffer vergeet het nie. Vroeëre voorbereiding: die verhaal stel die protagonis herhaaldelik as besluiteloos voor; die vergete koffer het twee keer vroeër verskyn. Die einde is bevredigend juis omdat dit onopgelos is.",
        commonErrors: [
          "Die einde opsom eerder as die effek te ontleed.",
          "'n Dubbelsinnige einde as swakheid behandel.",
          "Nie die einde aan vroeëre verhaalelemente koppel nie."
        ]
      },
      {
        question: "Bespreek die rol van ruimte in die skep van atmosfeer in 'n kortverhaal-uittreksel.",
        steps: [
          "Identifiseer die ruimte.",
          "Haal twee spesifieke beskrywende besonderhede aan.",
          "Verduidelik die atmosfeer wat hierdie besonderhede skep.",
          "Wys hoe die atmosfeer die leser se ervaring van gebeure beïnvloed."
        ],
        solution: "Ruimte: 'n verlate industriële gebou snags in winter. Besonderheid 1: 'die pype kreun soos iets lewendig maar nie levend nie' — personifikasie skep onheilspellende lewe in 'n dooie ruimte. Besonderheid 2: 'die vloer was glad met iets wat die flitslig nie kon benoem nie' — doelbewuste vaagheid skep nag. Atmosfeer: benoud, dreigend. Effek: die leser ervaar elke gebeure met verhoogde angs.",
        commonErrors: [
          "Die ruimte beskryf sonder dit aan atmosfeer te koppel.",
          "Atmosfeer as sinoniem vir stemming behandel sonder te verduidelik hoe ruimte dit skep.",
          "Nie spesifieke besonderhede aanhaal nie."
        ]
      },
      {
        question: "Identifiseer die sentrale konflik van 'n kortverhaal en verduidelik hoe dit die intrige dryf.",
        steps: [
          "Noem die konfligtipe: mens teen mens, mens teen self, mens teen samelewing.",
          "Beskryf die konflik spesifiek.",
          "Wys hoe die konflik die sentrale spanning skep.",
          "Verduidelik hoe die konflik aan die einde opgelos of onopgelos gelaat word."
        ],
        solution: "Konfligtipe: mens teen self. Spesifieke konflik: protagonis moet besluit om teen 'n korrupte beampte te getuig of stil te bly om haar kinders te beskerm. Sentrale spanning: elke toneel bou na haar keuse. Resolusie: sy getuig, maar die finale reël weier om die keuse te vier.",
        commonErrors: [
          "Konfligtipe identifiseer sonder die spesifieke konflik te verduidelik.",
          "Sentrale konflik met 'n subintrige verwar.",
          "Nie wys hoe die konflik die intrige dryf nie."
        ]
      }
    ]
  },

  "ENGF-5": {
    workedExamplesEn: [
      {
        question: "Change to passive: 'The principal awarded the learner a prize.'",
        steps: [
          "Identify the verb phrase: 'awarded'.",
          "Identify the direct object (what was awarded): 'a prize' → this becomes the new subject.",
          "Form passive: 'A prize was awarded to the learner by the principal.'",
          "Alternatively: 'The learner was awarded a prize by the principal.' (indirect object as subject)"
        ],
        solution: "A prize was awarded to the learner by the principal. OR The learner was awarded a prize by the principal. Both are correct passive transformations.",
        commonErrors: [
          "Using 'was award' instead of 'was awarded' (must use past participle).",
          "Keeping the original sentence structure and only adding 'by'.",
          "Forgetting that English allows two passive forms when there is both a direct and indirect object."
        ]
      },
      {
        question: "Identify and correct the errors in subject-verb concord: 'The crowd of students were cheering loudly.'",
        steps: [
          "Identify the subject: 'The crowd' (not 'students' — 'students' is part of a prepositional phrase).",
          "Determine if the subject is singular or plural: 'crowd' is a collective noun — in SA English, typically singular.",
          "Correct verb: 'was' (not 'were').",
          "Corrected sentence: 'The crowd of students was cheering loudly.'"
        ],
        solution: "Corrected: 'The crowd of students was cheering loudly.' Concord governs the head noun ('crowd'), not the noun in the prepositional phrase ('students').",
        commonErrors: [
          "Matching the verb to 'students' instead of 'crowd' — always find the head noun.",
          "In British English, collective nouns can take plural verbs — but SA exams follow SA conventions (singular).",
          "Changing 'cheering' to 'cheered' — the aspect (progressive) should remain; only the auxiliary changes."
        ]
      },
      {
        question: "Transform to reported speech: The teacher said, 'Do not submit your work late tomorrow.'",
        steps: [
          "Reporting verb: 'said' → for commands, use 'told' + object.",
          "Command → reported: use 'not to + infinitive' for negative imperatives.",
          "Shift 'tomorrow' → 'the next day'.",
          "Shift pronouns: 'your' → 'their' (or specify the group)."
        ],
        solution: "The teacher told the learners not to submit their work late the next day.",
        commonErrors: [
          "Using 'said that to not submit' — commands use 'told + object + not to'.",
          "Keeping 'tomorrow' instead of 'the next day'.",
          "Using 'told that' — 'told' is followed directly by the object, not by 'that'."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verander na passief: 'Die hoof het die leerder 'n prys toegeken.'",
        steps: [
          "Identifiseer die werkwoordgroep: 'het toegeken'.",
          "Identifiseer die direkte voorwerp: 'prys' → nuwe onderwerp.",
          "Vorm passief: 'n prys is/was ... toegeken.",
          "Alternatief: 'Die leerder is/was 'n prys toegeken.'"
        ],
        solution: "'n Prys is aan die leerder deur die hoof toegeken. OF Die leerder is 'n prys deur die hoof toegeken.",
        commonErrors: [
          "'Is toegekend' in plaas van 'is toegeken' gebruik.",
          "Die oorspronklike sinstruktuur behou.",
          "Vergeet dat Afrikaans twee passiewe vorms toelaat wanneer beide 'n direkte en indirekte voorwerp is."
        ]
      },
      {
        question: "Identifiseer en korrigeer die foute in onderwerp-werkwoord ooreenkoms: 'Die menigte studente was luid juigend.'",
        steps: [
          "Identifiseer die onderwerp: 'Die menigte' (nie 'studente' nie).",
          "Bepaal enkelvoud of meervoud: 'menigte' is 'n kollektiewe naamwoord — tipies enkelvoud.",
          "Korrekte werkwoord: 'was' (nie 'waren' nie).",
          "Gekorrigeerde sin: 'Die menigte studente was luid juigend.'"
        ],
        solution: "Gekorrigeer: 'Die menigte studente was luid juigend.' Ooreenkoms is met die hoofnaamwoord ('menigte'), nie die voorwerp in die voorsetselgroep nie.",
        commonErrors: [
          "Die werkwoord met 'studente' in plaas van 'menigte' stem.",
          "Die progressiewe aspek ('juigend') verander — slegs die hulpwerkwoord verander.",
          "In Engels kan kollektiewe naamwoorde meervoud werkwoorde neem — SA-eksamen volg SA-konvensies."
        ]
      },
      {
        question: "Verander na rapporteerende rede: Die onderwyser het gesê, 'Moet nie jou werk môre laat indien nie.'",
        steps: [
          "Rapporteringswerkwoord: 'het gesê' → vir bevele gebruik 'het gesê ... moet nie'.",
          "Bevel → gerapporteer: gebruik 'om nie te + infinitief' of SA-patroon.",
          "Verskuif 'môre' → 'die volgende dag'.",
          "Verskuif voornaamwoorde: 'jou' → 'hulle/sy'."
        ],
        solution: "Die onderwyser het die leerders gesê om nie hulle werk die volgende dag laat in te dien nie.",
        commonErrors: [
          "Bevel nie met die korrekte patroon omskakel nie.",
          "'Môre' hou in plaas van 'die volgende dag'.",
          "'Het gesê dat om nie' gebruik — die konstruksie verskil in Afrikaans."
        ]
      }
    ]
  },

  "ENGF-6": {
    workedExamplesEn: [
      {
        question: "Write a summary of 7 main points from a given passage, in no more than 80 words.",
        steps: [
          "Read the passage and identify the main argument.",
          "Underline the key idea in each paragraph.",
          "List 7 key ideas — not details or examples.",
          "Rewrite in your own words, in complete sentences, under 80 words."
        ],
        solution: "Method: identify 7 non-overlapping ideas, one per paragraph typically. Write in complete sentences. Do not quote. Check word count. Model: 'The passage argues that digital technology affects youth in seven ways: it reduces sleep, increases anxiety, lowers academic performance, decreases physical activity, shortens attention spans, offers educational benefits, and responds to parental supervision.' (34 words — room for more detail on each point.)",
        commonErrors: [
          "Quoting directly from the passage — always paraphrase.",
          "Listing more or fewer than 7 points.",
          "Exceeding 80 words — count carefully."
        ]
      },
      {
        question: "Read the passage and answer: 'What does the writer mean by the phrase \"a silent revolution\"?'",
        steps: [
          "Find the phrase in the passage.",
          "Read the context around it (2-3 sentences before and after).",
          "Identify what 'revolution' refers to (a major change) and why it is 'silent' (unnoticed/gradual).",
          "Write an explanation in your own words, in a complete sentence."
        ],
        solution: "In context, the writer uses 'silent revolution' to describe the gradual transformation of reading habits among young people, from physical books to digital screens. The 'revolution' refers to the scale of the change; 'silent' indicates that this transformation happened quietly, without public attention or debate, making it harder to notice until the effects (reduced deep reading, shorter attention spans) were already significant.",
        commonErrors: [
          "Quoting the phrase back without explaining it ('it means a silent revolution').",
          "Not using context — the phrase must be explained in its specific context, not generally.",
          "Offering too brief an answer — contextual vocabulary questions require explanation, not just a synonym."
        ]
      },
      {
        question: "Identify and explain a writer's use of rhetorical questions in a passage, noting the intended effect on the reader.",
        steps: [
          "A rhetorical question: one asked for effect, not to obtain an answer.",
          "Quote the rhetorical question from the passage.",
          "Explain the implied answer.",
          "Explain the intended effect on the reader (provokes thought, creates urgency, involves reader)."
        ],
        solution: "Rhetorical question: 'How many of us have watched a child scroll for an hour without once looking up?' Implied answer: many — the question assumes universal experience. Effect: the writer uses the shared experience to build solidarity with readers who recognise the behaviour, making the argument personal rather than abstract. The 'us' positions the reader as both witness and participant, increasing emotional investment in the writer's argument.",
        commonErrors: [
          "Treating a rhetorical question as one that has no answer — rhetorical questions have implied answers.",
          "Not explaining the effect — identifying the device is not enough.",
          "Quoting a regular question rather than a rhetorical one — check whether the writer expects a response."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Skryf 'n opsomming van 7 hoofpunte uit 'n gegewe teks, in nie meer as 80 woorde nie.",
        steps: [
          "Lees die teks en identifiseer die hoofargument.",
          "Onderstreep die sleutelgedagte in elke paragraaf.",
          "Lys 7 sleutelgedagtes — nie besonderhede of voorbeelde nie.",
          "Herskryf in eie woorde, in volsin, onder 80 woorde."
        ],
        solution: "Metode: identifiseer 7 nie-oorvleuelende gedagtes. Skryf in volsin. Haal nie aan nie. Tel woorde. Model: 'Die teks voer aan digitale tegnologie raak jeug op sewe maniere: verminder slaap, verhoog angs, verlaag akademiese prestasie, verminder fisieke aktiwiteit, verkort aandag-spanne, bied opvoedkundige voordele, reageer op ouertoesig.'",
        commonErrors: [
          "Direk uit die teks aanhaal.",
          "Meer of minder as 7 punte lys.",
          "80 woorde oorskry."
        ]
      },
      {
        question: "Lees die teks en beantwoord: 'Wat bedoel die skrywer met die frase \"stille revolusie\"?'",
        steps: [
          "Vind die frase in die teks.",
          "Lees die konteks rondom dit.",
          "Identifiseer wat 'revolusie' verwys (groot verandering) en hoekom dit 'stil' is (ongemerk/geleidelik).",
          "Skryf 'n verduideliking in eie woorde."
        ],
        solution: "In konteks gebruik die skrywer 'stille revolusie' om die geleidelike transformasie van leesgewoontes by jong mense te beskryf. Die 'revolusie' verwys na die omvang van die verandering; 'stil' dui aan dit het sonder openbare aandag geskied, wat dit moeilik maak om te merk totdat die effekte reeds aansienlik was.",
        commonErrors: [
          "Die frase terug haal sonder dit te verduidelik.",
          "Nie konteks gebruik nie.",
          "Te beknopte antwoord bied."
        ]
      },
      {
        question: "Identifiseer en verduidelik 'n skrywer se gebruik van retoriese vrae in 'n teks, met die beoogde effek op die leser.",
        steps: [
          "Retoriese vraag: een wat vir effek gevra word, nie om 'n antwoord te verkry nie.",
          "Haal die retoriese vraag aan.",
          "Verduidelik die geïmpliseerde antwoord.",
          "Verduidelik die beoogde effek op die leser."
        ],
        solution: "Retoriese vraag: 'Hoeveel van ons het 'n kind 'n uur lank skuif sonder om eenmaal op te kyk?' Geïmpliseerde antwoord: baie. Effek: die skrywer gebruik die gedeelde ervaring om solidariteit te bou; 'ons' plaas die leser as getuie en deelnemer, wat emosionele betrokkenheid verhoog.",
        commonErrors: [
          "Retoriese vraag as een sonder antwoord behandel.",
          "Nie die effek verduidelik nie.",
          "'n Gewone vraag in plaas van 'n retoriese aanhaal."
        ]
      }
    ]
  },

  "ENGF-7": {
    workedExamplesEn: [
      {
        question: "Write a thesis statement for: 'Social media does more harm than good to Grade 12 learners.'",
        steps: [
          "Choose your stance.",
          "Preview 2-3 main arguments.",
          "Write in one complex sentence."
        ],
        solution: "Although social media provides Grade 12 learners with useful study resources and peer support, it ultimately causes more harm than good by disrupting sleep, fuelling academic dishonesty, and increasing social anxiety during an already stressful year.",
        commonErrors: [
          "Writing a fact ('Social media is used by most learners') — must be arguable.",
          "Too vague ('social media is bad for learners') — no arguments previewed.",
          "Writing a question instead of a statement."
        ]
      },
      {
        question: "Write a complete PEEL paragraph for the body of an argumentative essay: 'Homework should be banned.'",
        steps: [
          "Point: state a clear topic sentence.",
          "Evidence: provide a fact, statistic, or example.",
          "Explain: connect evidence to point.",
          "Link: connect to thesis."
        ],
        solution: "Point: Excessive homework significantly reduces learners' well-being without proportionally improving academic outcomes. Evidence: A 2022 study by the South African Human Rights Commission found that learners spending more than 2 hours per night on homework reported 45% higher rates of anxiety and 30% lower participation in extracurricular activities. Explain: When homework consumes time that could be spent on sleep, exercise, and family interaction, it damages the cognitive and emotional foundations that learning requires — meaning more homework can paradoxically produce less learning. Link: Banning excessive homework would therefore not undermine academic achievement but support the holistic development that the CAPS curriculum itself prioritises.",
        commonErrors: [
          "Weak evidence: 'Studies show homework is bad' — cite a specific study.",
          "Missing explanation — evidence without analysis is description.",
          "Forgetting the link — each paragraph must connect back to the essay's central argument."
        ]
      },
      {
        question: "Write an introduction for a narrative essay: 'The day my life changed.'",
        steps: [
          "Hook: begin with action or image in medias res (in the middle of action).",
          "Establish scene: setting and character.",
          "Create tension or foreshadowing.",
          "End with a sentence that propels the reader forward."
        ],
        solution: "The call came at 3 a.m. In retrospect, nothing good has ever been delivered by a phone ringing at 3 a.m. I lay in the dark, listening to it insist, knowing with a certainty I didn't want to know that this was the call that would divide my life into before and after. I reached for the phone.",
        commonErrors: [
          "Beginning with 'I am going to tell you about the day my life changed' — never announce the story.",
          "Starting with background (family history, setting description) rather than action — start where the story is most alive.",
          "Resolving the tension in the introduction — the hook must pull the reader forward, not summarise the outcome."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Skryf 'n tesisstelling vir: 'Sosiale media doen meer skade as goed aan Graad 12-leerders.'",
        steps: [
          "Kies jou standpunt.",
          "Sien 2-3 hoofargumente vooruit.",
          "Skryf in een komplekse sin."
        ],
        solution: "Alhoewel sosiale media Graad 12-leerders nuttige studiebronne bied, doen dit uiteindelik meer skade as goed deur slaap te ontwrig, akademiese oneerlikheid te aanmoedig en sosiale angs te verhoog tydens 'n reeds stresvolle jaar.",
        commonErrors: [
          "'n Feit skryf — moet betwisbaar wees.",
          "Te vaag — geen argumente voorskouend.",
          "'n Vraag in plaas van 'n stelling skryf."
        ]
      },
      {
        question: "Skryf 'n volledige PEEL-paragraaf vir: 'Huiswerk behoort verbied te word.'",
        steps: [
          "Punt: duidelike onderwerpsin.",
          "Bewys: feit, statistiek of voorbeeld.",
          "Verduidelik: koppel bewys aan punt.",
          "Skakel: koppel aan tesisstelling."
        ],
        solution: "Punt: Oormatige huiswerk verminder leerders se welstand sonder proporsioneel akademiese uitkomste te verbeter. Bewys: 2022 SAHRC-studie: leerders met meer as 2 uur per nag huiswerk rapporteer 45% hoër angsvlakke. Verduidelik: Wanneer huiswerk tyd verbruik vir slaap en spel, beskadig dit die grondslag wat leer vereis. Skakel: Verbod op oormatige huiswerk sal holistiese ontwikkeling ondersteun.",
        commonErrors: [
          "Swak bewys: 'Studies toon huiswerk is sleg'.",
          "Verduideliking gemis.",
          "Skakel vergeet."
        ]
      },
      {
        question: "Skryf 'n inleiding vir 'n narratiewe opstel: 'Die dag my lewe verander het.'",
        steps: [
          "Haak: begin met aksie of beeld in medias res.",
          "Stel ruimte en karakter voor.",
          "Skep spanning of vooruitwysing.",
          "Eindig met 'n sin wat die leser vorentoe dryf."
        ],
        solution: "Die oproep het om 3 nm gekom. In terugblik is niks goed ooit deur 'n foon wat om 3 nm lui afgelewer nie. Ek het in die donker gelê en luister hoe dit aandring, wetende met 'n sekerheid wat ek nie wou ken nie dat dit die oproep was wat my lewe in voor en na sou verdeel. Ek het na die foon gegryp.",
        commonErrors: [
          "Begin met 'Ek gaan vertel oor die dag my lewe verander het'.",
          "Begin met agtergrond eerder as aksie.",
          "Spanning in die inleiding oplos."
        ]
      }
    ]
  },

  "ENGF-8": {
    workedExamplesEn: [
      {
        question: "Write a formal letter applying for a part-time job.",
        steps: [
          "Your address (top right), date, recipient's address (left).",
          "Formal salutation: 'Dear Sir/Madam'.",
          "Opening: state position and source of advertisement.",
          "Body: highlight 2-3 relevant skills.",
          "Closing: thank and indicate availability.",
          "Close: 'Yours faithfully' + signature."
        ],
        solution: "14 Oak Street / Durban / 4001 / 25 May 2026 // The Manager / Greenleaf Bookshop / 6 Marine Parade / Durban 4001 // Dear Sir/Madam // I am writing to apply for the position of part-time Sales Assistant advertised on your website. I am a Grade 12 learner at Westville High School with a passion for literature, proven customer service experience from weekend volunteering at our school library, and strong organisational skills. I am available for an interview at your earliest convenience. // Yours faithfully / [Signature] / N. Dlamini",
        commonErrors: [
          "Using 'Yours sincerely' with 'Dear Sir/Madam' — must use 'faithfully' when recipient is unknown.",
          "Omitting the recipient's address.",
          "Starting the body with 'I am writing to tell you that' — state the purpose directly."
        ]
      },
      {
        question: "Write a notice announcing a school event.",
        steps: [
          "Heading: NOTICE (centred, bold).",
          "Date.",
          "Audience addressed.",
          "Key information: what, when, where, any requirements.",
          "Contact/RSVP if needed.",
          "Signed by relevant person/organisation."
        ],
        solution: "NOTICE // 25 May 2026 // To all Grade 12 learners // FAREWELL ASSEMBLY // The SRC cordially invites all Grade 12 learners to the annual Farewell Assembly to be held on Friday, 5 June 2026, at 14:00 in the school hall. Attendance is compulsory. Smart casual dress is required. For queries, contact the SRC at src@westvillehigh.ac.za. // SRC Executive Committee",
        commonErrors: [
          "Writing too much detail — notices should be brief and informative.",
          "Omitting essential details (date, time, venue) — the notice must answer all practical questions.",
          "Informal language — notices are formal public communications."
        ]
      },
      {
        question: "Write a report on a school excursion for submission to the principal.",
        steps: [
          "Heading: REPORT ON [EVENT], TO: [Principal], FROM: [Your name/class], DATE: [date].",
          "Introduction: event name, date, purpose.",
          "Body: what happened (briefly); outcomes or findings.",
          "Recommendations (if required).",
          "Conclusion: overall assessment.",
          "Signed."
        ],
        solution: "REPORT ON: Grade 12 Science Museum Excursion // TO: Ms P. Dlamini, Principal // FROM: Grade 12 Science Class // DATE: 25 May 2026 // Introduction: On 20 May 2026, the Grade 12 science class visited the Science Museum of Johannesburg to supplement learning on climate change. // Body: Learners attended two interactive workshops (Water Scarcity and Solar Energy). The majority rated the visit as highly educational. Three learners were absent due to illness. // Conclusion: The excursion successfully enriched classroom learning. We recommend that similar excursions be organised for the Physics section in Term 3. // Signed: N. Mokoena (Class Representative)",
        commonErrors: [
          "Writing in first person throughout — reports use third-person formal language.",
          "Not including a recommendation — reports for principals typically require one.",
          "Omitting the formal heading structure (To, From, Date)."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Skryf 'n formele brief om aansoek te doen vir 'n deeltydse werk.",
        steps: [
          "Jou adres (bo regs), datum, ontvanger se adres (links).",
          "Formele aanhef: 'Geagte Meneer/Mevrou'.",
          "Opening: stel pos en advertensiebron.",
          "Liggaam: beklemtoon 2-3 relevante vaardighede.",
          "Sluiting: bedank en dui beskikbaarheid aan.",
          "Sluit: 'Die uwe' + handtekening."
        ],
        solution: "14 Eikstraat / Durban / 4001 / 25 Mei 2026 // Die Bestuurder / Groeneblaar Boekwinkel / 6 Marine Parade / Durban 4001 // Geagte Meneer/Mevrou // Ek skryf om aansoek te doen vir die pos van deeltydse Verkoopsassistent. Ek is 'n Graad 12-leerder met 'n passie vir letterkunde en bewese kliëntediensservaring. // Die uwe / N. Dlamini",
        commonErrors: [
          "'Met vriendelike groete' gebruik met 'Geagte Meneer/Mevrou'.",
          "Die ontvanger se adres weglaat.",
          "Die liggaam begin met 'Ek skryf om te sê dat'."
        ]
      },
      {
        question: "Skryf 'n kennisgewing wat 'n skoolgeleentheid aankondig.",
        steps: [
          "Opskrif: KENNISGEWING (gesentreer).",
          "Datum.",
          "Gehoor aangespreek.",
          "Sleutelinligting: wat, wanneer, waar.",
          "Kontak/RSVP indien nodig.",
          "Onderteken deur relevante persoon."
        ],
        solution: "KENNISGEWING // 25 Mei 2026 // Aan alle Graad 12-leerders // AFSKEIDSVERGADERING // Die SRK nooi alle Graad 12-leerders hartlik uit na die jaarlikse Afskeidsvergadering op Vrydag, 5 Junie 2026, om 14:00 in die skoolsaal. Bywoning is verpligtend. // SRK Uitvoerende Komitee",
        commonErrors: [
          "Te veel detail skryf.",
          "Noodsaaklike besonderhede weglaat.",
          "Informele taal gebruik."
        ]
      },
      {
        question: "Skryf 'n verslag oor 'n skooluitstappie vir indiening by die hoof.",
        steps: [
          "Opskrif: VERSLAG OOR [GELEENTHEID], AAN, VAN, DATUM.",
          "Inleiding: gebeurtenis, datum, doel.",
          "Liggaam: wat het gebeur; uitkomste.",
          "Aanbevelings (indien vereis).",
          "Slot: algehele assessering.",
          "Onderteken."
        ],
        solution: "VERSLAG OOR: Graad 12 Wetenskap-museum Uitstappie // AAN: Me P. Dlamini, Hoof // VAN: Graad 12 Wetenskapklas // DATUM: 25 Mei 2026 // Inleiding: Op 20 Mei 2026 het die klas die Wetenskapmuseum besoek. // Liggaam: Leerders het twee interaktiewe werksessies bygewoon. Die meerderheid het dit uiters leersaam gevind. // Slot: Die uitstappie het klaskamerleer suksesvol verryk. Ons beveel soortgelyke uitstappies vir Term 3 aan. // Onderteken: N. Mokoena",
        commonErrors: [
          "Regdeur in eerstepersoon skryf.",
          "Nie 'n aanbeveling insluit nie.",
          "Die formele opskrif-struktuur weglaat."
        ]
      }
    ]
  },

  // ===================== AFRIKAANS FIRST ADDITIONAL LANGUAGE (AFRF) =====================

  "AFRF-1": {
    workedExamplesEn: [
      {
        question: "Write a PEEL paragraph on how the protagonist's childhood shapes their adult behaviour in the novel.",
        steps: [
          "Point: state a focused link between childhood experience and adult behaviour.",
          "Evidence: reference a specific childhood scene and an adult scene.",
          "Explain: show the causal relationship.",
          "Link: connect to the novel's theme."
        ],
        solution: "Point: The protagonist's experience of abandonment in childhood directly shapes his compulsive self-reliance as an adult. Evidence: In Chapter 2, his mother's departure is described through his eyes as a child: '[h]y het geweet mense gaan, dis wat mense doen'. By adulthood, he refuses help from anyone, telling his colleague 'ek doen dit self' even when he clearly cannot cope. Explain: The childhood belief that people always leave becomes a self-fulfilling prophecy — by refusing connection, he guarantees isolation. Link: The novel explores how formative wounds, unacknowledged, perpetuate themselves across a lifetime.",
        commonErrors: [
          "Describing childhood and adult behaviour without showing the causal link.",
          "Only referencing one time period when two are required.",
          "Not connecting to the theme in the link."
        ]
      },
      {
        question: "Compare the protagonist and antagonist in terms of their attitude to power.",
        steps: [
          "Describe the protagonist's attitude to power: how do they use or seek it?",
          "Describe the antagonist's attitude: contrast clearly.",
          "Use one textual reference for each character.",
          "Draw a conclusion about what the contrast reveals thematically."
        ],
        solution: "The protagonist consistently resists power — she refuses the promotion that would require compromising her principles (Chapter 5 reference). The antagonist, by contrast, treats power as the only valid language: 'Mag is al wat mense respekteer' (Chapter 8). The contrast reveals the novel's central moral argument: those who seek power for its own sake destroy what they claim to protect, while those who resist it often have more authentic influence through integrity.",
        commonErrors: [
          "Describing one character fully and only briefly mentioning the other.",
          "Not using textual evidence for both.",
          "Not drawing a thematic conclusion from the contrast."
        ]
      },
      {
        question: "Explain how irony is used in the prescribed novel, with one example.",
        steps: [
          "Define the type of irony (verbal, situational, or dramatic).",
          "Quote or closely reference the moment of irony.",
          "Explain the gap between appearance and reality that creates the irony.",
          "State the author's purpose in using irony here."
        ],
        solution: "Situational irony: the protagonist spends the novel trying to escape her hometown, only to discover in the final chapter that the 'freedom' she found in the city has made her more imprisoned than she ever was at home. The irony lies in the gap between her expectation (city = freedom, hometown = imprisonment) and the reality (the city's anonymity creates loneliness; the hometown's familiarity offered connection). The author uses irony to subvert the traditional migration narrative and suggest that belonging is not a place but a relationship to oneself.",
        commonErrors: [
          "Confusing irony types (verbal, situational, dramatic).",
          "Identifying the irony without explaining the gap between appearance and reality.",
          "Not explaining the author's purpose."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Skryf 'n PEEL-paragraaf oor hoe die protagonis se kinderjare sy/haar volwasse gedrag vorm.",
        steps: [
          "Punt: stel 'n gefokusde verband tussen kinderjare-ervaring en volwasse gedrag.",
          "Bewys: verwys na 'n spesifieke kinderjare-toneel en 'n volwasse toneel.",
          "Verduidelik: wys die kousale verband.",
          "Skakel: koppel aan die roman se tema."
        ],
        solution: "Punt: Die protagonis se ervaring van verlating in sy kinderjare vorm direk sy kompulsiewe selfstandigheid as volwassene. Bewys: Hoofstuk 2: sy moeder se vertrek: '[h]y het geweet mense gaan'. As volwassene weier hy hulp. Verduidelik: Die kinderjare-geloof skep 'n selfvervullende profesie. Skakel: Die roman verken hoe onherkenende wonde hulself herhaal.",
        commonErrors: [
          "Kinderjare en volwasse gedrag beskryf sonder die kousale verband.",
          "Slegs een tydperk verwys.",
          "Nie die tema in die skakel koppel nie."
        ]
      },
      {
        question: "Vergelyk die protagonis en antagonis ten opsigte van hul houding teenoor mag.",
        steps: [
          "Beskryf die protagonis se houding teenoor mag.",
          "Beskryf die antagonis se houding: kontrasteer duidelik.",
          "Gebruik een tekstuele verwysing vir elke karakter.",
          "Trek 'n gevolgtrekking oor wat die kontras tematies onthul."
        ],
        solution: "Die protagonis weerstaan konsekwent mag — sy weier die bevordering wat kompromis vereis (Hoofstuk 5). Die antagonis behandel mag as die enigste geldige taal: 'Mag is al wat mense respekteer' (Hoofstuk 8). Die kontras onthul: dié wat mag vir eie onthalwe soek, vernietig wat hulle beweer te beskerm.",
        commonErrors: [
          "Een karakter volledig beskryf en die ander slegs kortliks noem.",
          "Nie tekstuele bewys vir albei gebruik nie.",
          "Nie 'n tematiese gevolgtrekking trek nie."
        ]
      },
      {
        question: "Verduidelik hoe ironie in die voorgeskrewe roman gebruik word, met een voorbeeld.",
        steps: [
          "Definieer die tipe ironie (verbaal, situasioneel of dramaties).",
          "Haal aan of verwys naby na die ironie-moment.",
          "Verduidelik die gaping tussen voorkoms en werklikheid.",
          "Stel die outeur se doel."
        ],
        solution: "Situasionele ironie: die protagonis spandeer die roman om haar dorpie te ontvlug, net om in die finale hoofstuk te ontdek dat die 'vryheid' in die stad haar meer gevange gemaak het as tuis. Die ironie lê in die gaping tussen haar verwagting (stad = vryheid) en werklikheid (anonimiteit skep eensaamheid). Die outeur gebruik ironie om die tradisionele migrasie-verhaal te ondermyn.",
        commonErrors: [
          "Ironietipes verwar.",
          "Die ironie identifiseer sonder die gaping te verduidelik.",
          "Die outeur se doel nie verduidelik nie."
        ]
      }
    ]
  },

  "AFRF-2": {
    workedExamplesEn: [
      {
        question: "Analyse how conflict develops in the Afrikaans drama, tracing it from introduction to climax.",
        steps: [
          "Identify the initial source of conflict.",
          "Show how the conflict intensifies across the acts.",
          "Identify the climax (point of maximum tension).",
          "Note whether conflict is resolved or left open."
        ],
        solution: "Initial conflict: the father's refusal to acknowledge his son's chosen career (Act 1). Intensification: the son's marriage to a woman the father disapproves of adds a second conflict (Act 2); the father disinherits the son (Act 2 Scene 4) — the material stakes are raised. Climax: Act 3 Scene 2 — the son publicly confronts the father at the family gathering, each stating what they have withheld throughout the play. Resolution: ambiguous — they leave in separate directions, suggesting coexistence without reconciliation.",
        commonErrors: [
          "Jumping straight to the climax without tracing development.",
          "Confusing the climax with the resolution — they are different dramatic moments.",
          "Not noting the ambiguity of resolution — not all plays end with reconciliation."
        ]
      },
      {
        question: "Explain the significance of a turning point (dramatiese wending) in the play, and its effect on the protagonist.",
        steps: [
          "Identify the turning point.",
          "Describe what was true before and what changes after.",
          "Explain the effect on the protagonist's character arc.",
          "Link to the play's theme."
        ],
        solution: "Turning point: Act 2 Scene 3 — the protagonist overhears his mother admitting she always preferred his brother. Before: he believed his mother's silence was fair; after: he understands his entire childhood was filtered through her preference. Effect on protagonist: he shifts from seeking his parents' approval to accepting that approval was never available — a painful liberation. Theme link: the play explores how illusions about family love sustain people, and what happens when those illusions are destroyed.",
        commonErrors: [
          "Choosing a significant event that doesn't actually change the plot's direction.",
          "Not explaining the before/after contrast clearly.",
          "Not connecting to theme."
        ]
      },
      {
        question: "Discuss how the dialogue in the play reveals character more effectively than physical description.",
        steps: [
          "Select a key dialogue exchange.",
          "Identify what each character's words reveal about their personality, values, or relationships.",
          "Explain why dialogue is a more powerful character-revelation tool than direct description.",
          "Use a specific quotation."
        ],
        solution: "Key dialogue (Act 1 Scene 4): Father: 'Daar's net een manier om dinge te doen, en dis my manier.' Son: 'Jy noem dit jou manier, ek noem dit bangheid.' The father's line reveals rigidity and the use of authority to suppress self-doubt. The son's response reveals intellectual courage but also provocation — he is not simply rebelling but naming the subtext the father cannot. A stage direction saying 'the father was a controlling man' could not convey this — dialogue shows how control operates, not just that it exists.",
        commonErrors: [
          "Paraphrasing dialogue rather than quoting it.",
          "Analysing only one character's dialogue rather than the exchange.",
          "Not explaining why dialogue is superior to description for this purpose."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Ontleed hoe konflik in die Afrikaanse drama ontwikkel, van inleiding tot klimaks.",
        steps: [
          "Identifiseer die aanvanklike bron van konflik.",
          "Wys hoe die konflik oor die bedrywe intensifiseer.",
          "Identifiseer die klimaks.",
          "Let op of konflik opgelos of oop gelaat word."
        ],
        solution: "Aanvanklike konflik: vader se weiering om sy seun se gekose loopbaan te erken (Bedryf 1). Intensivering: seun se huwelik verhoog 'n tweede konflik (Bedryf 2); onterving (Bedryf 2, Toneel 4). Klimaks: Bedryf 3, Toneel 2 — seun konfronteer vader openlik. Resolusie: dubbelsinnig.",
        commonErrors: [
          "Direk na die klimaks spring sonder ontwikkeling te volg.",
          "Klimaks en resolusie verwar.",
          "Dubbelsinnigheid van resolusie nie noem nie."
        ]
      },
      {
        question: "Verduidelik die betekenis van 'n dramatiese wending in die drama en die effek op die protagonis.",
        steps: [
          "Identifiseer die wending.",
          "Beskryf wat voor en na die wending waar is.",
          "Verduidelik die effek op die protagonis se karakterontwikkeling.",
          "Koppel aan die drama se tema."
        ],
        solution: "Wending: Bedryf 2, Toneel 3 — protagonis hoor toevallig hoe sy moeder toegee dat sy altyd sy broer verkies het. Voor: hy glo sy moeder se stilte was billik. Na: hy verstaan sy hele kinderjare was deur haar voorkeur gefilteer. Effek: hy verskuif van goedkeuring soek na aanvaarding dat goedkeuring nooit beskikbaar was. Temakoppeling: illusies oor gesinliefde.",
        commonErrors: [
          "'n Beduidende gebeurtenis kies wat nie werklik die plot se rigting verander nie.",
          "Die voor/na-kontras nie duidelik verduidelik nie.",
          "Nie aan die tema koppel nie."
        ]
      },
      {
        question: "Bespreek hoe dialoog in die drama karakter meer doeltreffend onthul as fisiese beskrywing.",
        steps: [
          "Kies 'n sleutel-dialoogruil.",
          "Identifiseer wat elke karakter se woorde openbaar.",
          "Verduidelik hoekom dialoog 'n kragtiger karakter-onthullingstegniek is as direkte beskrywing.",
          "Gebruik 'n spesifieke aanhaling."
        ],
        solution: "Sleutel-dialoog (Bedryf 1, Toneel 4): Vader: 'Daar's net een manier om dinge te doen, en dis my manier.' Seun: 'Jy noem dit jou manier, ek noem dit bangheid.' Die vader se reël onthul rigiditeit en gebruik van gesag om twyfel te onderdruk. Die seun se reaksie onthul intellektuele moed maar ook uitlokking. 'n Toneelaanwysing wat sê 'die vader was beheersend' sou nie hierdie nuanse kon oordra nie.",
        commonErrors: [
          "Dialoog parafraseer eerder as aanhaal.",
          "Slegs een karakter se dialoog ontleed.",
          "Nie verduidelik hoekom dialoog bo beskrywing is nie."
        ]
      }
    ]
  },

  "AFRF-3": {
    workedExamplesEn: [
      {
        question: "Analyse the use of contrast in an Afrikaans poem to develop meaning.",
        steps: [
          "Identify the central contrast in the poem (e.g. light/dark, life/death, past/present).",
          "Find specific lines or stanzas that establish each side of the contrast.",
          "Explain how the contrast creates tension or deepens meaning.",
          "State the thematic conclusion that the contrast leads to."
        ],
        solution: "Central contrast: silence vs speech. Stanza 1 establishes silence: 'jy het nooit gepraat nie, selfs toe jy kon'. Stanza 3 establishes speech: 'nou dat jy weg is, praat ek voortdurend / as of jou woorde my mond gevul het'. The contrast creates profound irony: the living person's silence becomes the dead person's endless speech through the survivor's voice. Thematic conclusion: grief makes us speak for those who cannot, transforming silence into presence — the poem suggests that love outlives the person through language.",
        commonErrors: [
          "Identifying the contrast without showing how it operates across the poem.",
          "Not using specific lines to ground the analysis.",
          "Stating the contrast without drawing a thematic conclusion."
        ]
      },
      {
        question: "Explain the use of repetition in an Afrikaans poem and its effect.",
        steps: [
          "Identify the repeated word, phrase, or structural element.",
          "Note where and how frequently it recurs.",
          "Explain the cumulative effect of the repetition.",
          "Connect to the poem's emotional or thematic purpose."
        ],
        solution: "Repeated phrase: 'Ek wag nog' — appears at the start of stanzas 1, 3, and 5. Effect: the repeated phrase creates a monotonous rhythm that enacts waiting itself — the reader experiences the tedium and hopelessness of waiting through the structural repetition. By stanza 5, the phrase has transformed from active waiting to resignation: the context reveals the protagonist no longer expects the person to come. The repetition thus measures the emotional journey from hope to surrender.",
        commonErrors: [
          "Identifying the repetition without explaining its cumulative effect.",
          "Treating repetition as a structural accident rather than a deliberate technique.",
          "Not showing how the meaning of the repeated phrase changes across the poem."
        ]
      },
      {
        question: "Identify and explain the effect of a sound device (alliteration, assonance, or onomatopoeia) in a stanza.",
        steps: [
          "Quote the stanza.",
          "Identify the sound device specifically.",
          "Explain the physical sound it creates when read aloud.",
          "Explain how this sound supports the poem's meaning or mood."
        ],
        solution: "Stanza: 'Die wind wieg 'n wieg van water / weeklank weef deur die woude'. Alliteration: 'w' sounds repeated throughout. Physical sound: the 'w' creates a soft, billowing, waving sound when read aloud. Meaning support: the sound mimics the physical movement of wind through water and trees — the poem is describing natural motion and the alliteration embodies that motion in the act of reading. The reader's mouth performs the poem's subject.",
        commonErrors: [
          "Identifying the device without describing the physical sound it creates.",
          "Explaining the sound without connecting it to meaning or mood.",
          "Confusing alliteration (initial consonants) with assonance (internal vowels)."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Ontleed die gebruik van kontras in 'n Afrikaanse gedig om betekenis te ontwikkel.",
        steps: [
          "Identifiseer die sentrale kontras in die gedig.",
          "Vind spesifieke reëls of strofes wat elke kant van die kontras vestig.",
          "Verduidelik hoe die kontras spanning skep of betekenis verdiep.",
          "Stel die tematiese gevolgtrekking."
        ],
        solution: "Sentrale kontras: stilte vs spraak. Strofe 1: 'jy het nooit gepraat nie'. Strofe 3: 'nou praat ek voortdurend / as of jou woorde my mond gevul het'. Die kontras skep diepgaande ironie: die lewende se stilte word die dooie se ewige spraak. Tematiese gevolgtrekking: droefheid laat ons praat vir dié wat nie kan nie — liefde leef voort deur taal.",
        commonErrors: [
          "Die kontras identifiseer sonder te wys hoe dit oor die gedig werk.",
          "Nie spesifieke reëls gebruik nie.",
          "Die kontras noem sonder 'n tematiese gevolgtrekking."
        ]
      },
      {
        question: "Verduidelik die gebruik van herhaling in 'n Afrikaanse gedig en die effek.",
        steps: [
          "Identifiseer die herhaalde woord, frase of strukturele element.",
          "Let op waar en hoe gereeld dit herhaal.",
          "Verduidelik die kumulatiewe effek van die herhaling.",
          "Koppel aan die gedig se emosionele of tematiese doel."
        ],
        solution: "Herhaalde frase: 'Ek wag nog' — verskyn aan die begin van strofes 1, 3 en 5. Effek: skep 'n eentonige ritme wat wag self beliggaam. Teen Strofe 5 het die frase verander van aktiewe verwagting na berusting. Die herhaling meet die emosionele reis van hoop na oorgawe.",
        commonErrors: [
          "Die herhaling identifiseer sonder die kumulatiewe effek te verduidelik.",
          "Herhaling as toevallig behandel eerder as doelbewus.",
          "Nie wys hoe die betekenis van die herhaalde frase verander nie."
        ]
      },
      {
        question: "Identifiseer en verduidelik die effek van 'n klanktegniek (alliterasie, assonansie of onomatopee) in 'n strofe.",
        steps: [
          "Haal die strofe aan.",
          "Identifiseer die klanktegniek spesifiek.",
          "Verduidelik hoe die klank die gedig se betekenis of stemming ondersteun."
        ],
        solution: "Strofe: 'Die wind wieg 'n wieg van water / weeklank weef deur die woude'. Alliterasie: 'w'-klanke herhaal regdeur. Fisiese klank: die 'w' skep 'n sagte, golfende geluid wanneer hardop gelees. Betekenisondersteuning: die klank boots die fisiese beweging van wind deur water en bome na — die gedig beskryf natuurlike beweging en die alliterasie beliggaam dit in die leesdaad self.",
        commonErrors: [
          "Die klanktegniek identifiseer sonder die fisiese klank te beskryf.",
          "Die fisiese klank verduidelik sonder dit aan betekenis of stemming te koppel.",
          "Alliterasie (aanvangskonsonante) met assonansie (interne klinkers) verwar."
        ]
      }
    ]
  },

  "AFRF-4": {
    workedExamplesEn: [
      {
        question: "Analyse how a single dominant conflict drives the entire plot of an Afrikaans short story.",
        steps: [
          "Identify the central conflict (person vs person, person vs self, person vs society, or person vs nature).",
          "Trace how this conflict is introduced, intensified, and resolved (or left unresolved).",
          "Show how the compressed form forces every scene to serve the conflict directly.",
          "State the theme that emerges from the conflict."
        ],
        solution: "Central conflict: Maans vs his father (person vs person) over whether to leave the farm. Introduction: Maans announces his university place at the opening. Intensification: three tense conversations reveal the father's fear of losing the farm and Maans's desire for a different life. Resolution: Maans leaves; father watches the truck disappear in silence — the conflict is not neatly resolved. Theme: the tension between tradition and individual aspiration. Every scene (breakfast argument, fence-mending, the final evening) serves this single conflict.",
        commonErrors: [
          "Retelling the plot instead of analysing how conflict structures the story.",
          "Identifying multiple conflicts of equal weight instead of the dominant one.",
          "Forgetting that short stories often have unresolved or ambiguous endings — and failing to interpret that choice."
        ]
      },
      {
        question: "Discuss the role of the narrator's perspective (point of view) in an Afrikaans short story.",
        steps: [
          "Identify the narrative voice: first-person (ek), third-person limited, or omniscient.",
          "Explain what the narrator knows and what is deliberately withheld.",
          "Show how this perspective shapes the reader's sympathy or suspense.",
          "Link to the story's theme or message."
        ],
        solution: "Narrative voice: first-person ('ek'-verteller). The narrator is a child observing the adults' behaviour without fully understanding it. This limited perspective withholds adult motivations, creating dramatic irony — the reader understands more than the narrator. Sympathy: readers feel protective of the naive child-narrator. Suspense: the narrator's confusion about why the mother cries becomes the reader's mystery. Theme: childhood innocence confronting adult complexity.",
        commonErrors: [
          "Confusing the narrator with the author.",
          "Describing what the narrator sees without analysing the effect of the limited knowledge.",
          "Ignoring how the perspective controls reader sympathy."
        ]
      },
      {
        question: "Explain how a symbol functions in an Afrikaans short story to deepen meaning.",
        steps: [
          "Identify the symbol and the first time it appears in the text.",
          "Track how the symbol recurs or evolves.",
          "Explain what the symbol represents at the literal and figurative level.",
          "State how the symbol connects to the story's theme."
        ],
        solution: "Symbol: the dry, cracked dam wall. First appearance: described as the father stares at it in the opening paragraph. Recurrence: mentioned again when he refuses to invest in repairs, and finally appears broken open in the flood scene. Literal level: a piece of infrastructure in disrepair. Figurative level: the father's refusal to adapt or accept help — the dam mirrors his emotional rigidity. Theme: stubbornness leads to catastrophic loss.",
        commonErrors: [
          "Identifying the symbol but only describing it rather than interpreting it.",
          "Missing the evolution of the symbol across the text.",
          "Confusing a symbol with a mere descriptive detail — symbols recur and carry accumulated meaning."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Ontleed hoe 'n enkele dominante konflik die hele intrige van 'n Afrikaanse kortverhaal dryf.",
        steps: [
          "Identifiseer die sentrale konflik (persoon teen persoon, self, samelewing of natuur).",
          "Volg hoe die konflik ingelei, verskerp en opgelos (of onopgelos gelaat) word.",
          "Wys hoe die saamgeperste vorm elke toneel direk aan die konflik laat dien.",
          "Stel die tema wat uit die konflik voortspruit."
        ],
        solution: "Sentrale konflik: Maans teen sy vader oor of hy die plaas moet verlaat. Inleiding: Maans kondig sy universiteitsplek aan. Verskerping: drie gespanne gesprekke toon die vader se vrees en Maans se verlange. Oplossing: Maans vertrek; vader kyk die vragmotor in stilte na — onopgelos. Tema: spanning tussen tradisie en individuele strewe. Elke toneel dien hierdie konflik.",
        commonErrors: [
          "Die intrige vertel sonder die konflik te ontleed.",
          "Meervoudige konflikte van gelyke gewig identifiseer.",
          "Vergeet dat kortverhale dikwels onopgeloste eindes het en nalaat om dit te interpreteer."
        ]
      },
      {
        question: "Bespreek die rol van die vertellersperspektief in 'n Afrikaanse kortverhaal.",
        steps: [
          "Identifiseer die vertellersstem: eerste persoon, derde persoon beperk of alwetend.",
          "Verduidelik wat die verteller weet en wat doelbewus weerhou word.",
          "Wys hoe hierdie perspektief die leser se simpatie of spanning vorm.",
          "Koppel aan die tema."
        ],
        solution: "Vertellersstem: eerste persoon ('ek'-verteller). Kind-verteller observeer volwassenes sonder om hulle ten volle te verstaan. Hierdie beperkte perspektief skep dramatiese ironie — die leser verstaan meer as die verteller. Simpatie: die leser voel beskermend teenoor die naïewe kind. Spanning: die kind se verwarring word die leser se raaisel. Tema: kinderlike onskuld voor volwasse werklikheid.",
        commonErrors: [
          "Die verteller met die outeur verwar.",
          "Beskryf wat die verteller sien sonder die effek van die beperkte kennis te ontleed.",
          "Die perspektief se invloed op leserssimpatie ignoreer."
        ]
      },
      {
        question: "Verduidelik hoe 'n simbool in 'n Afrikaanse kortverhaal betekenis verdiep.",
        steps: [
          "Identifiseer die simbool en die eerste keer dit verskyn.",
          "Volg hoe die simbool herhaal of ontwikkel.",
          "Verduidelik wat die simbool op letterlike en figuurlike vlak verteenwoordig.",
          "Stel hoe die simbool aan die tema koppel."
        ],
        solution: "Simbool: die droë, gekraakte damwal. Eerste verskyning: vader staar daarna in die openingsparagraaf. Herhaling: genoem wanneer hy weier om te herstel; uiteindelik breek dit in die vloeiscène. Letterlik: vervallende infrastruktuur. Figuurlik: vader se onwilligheid om aan te pas — die dam weerspieël sy emosionele starheid. Tema: koppigheid lei tot katastrofale verlies.",
        commonErrors: [
          "Die simbool identifiseer maar slegs beskryf.",
          "Die ontwikkeling van die simbool deur die teks mislap.",
          "Simbool verwar met blote beskrywende detail."
        ]
      }
    ]
  },

  "AFRF-5": {
    workedExamplesEn: [
      {
        question: "Identify the word class of each underlined word and justify your answer: 'The old man quickly ran towards the red house.'",
        steps: [
          "List each underlined word.",
          "Name its word class.",
          "Give a reason for each classification (what function does it serve in the sentence?)."
        ],
        solution: "'old' = adjective (modifies the noun 'man'). 'quickly' = adverb (modifies the verb 'ran', answering 'how?'). 'towards' = preposition (shows the spatial relationship between 'ran' and 'house'). 'red' = adjective (modifies the noun 'house'). Justification strategy: ask what question the word answers — adjectives answer 'which/what kind', adverbs answer 'how/when/where', prepositions link nouns to verbs.",
        commonErrors: [
          "Classifying 'quickly' as an adjective because it ends in '-ly' — test function, not form.",
          "Confusing prepositions with conjunctions ('towards' relates position; 'and/but' joins clauses).",
          "Omitting the justification — identification alone earns 1 mark; justification earns the second."
        ]
      },
      {
        question: "Rewrite the following active sentence in the passive voice: 'The teacher marked the test.'",
        steps: [
          "Identify the subject (agent), verb and object of the active sentence.",
          "Make the object the new subject.",
          "Change the verb to 'to be' + past participle.",
          "Add 'by + agent' if required."
        ],
        solution: "Active: The teacher (subject) marked (verb) the test (object). Step 2: 'the test' becomes the new subject. Step 3: verb becomes 'was marked'. Step 4: agent = 'by the teacher'. Passive: 'The test was marked by the teacher.' Note: tense of 'to be' matches original tense ('marked' = past → 'was').",
        commonErrors: [
          "Forgetting to match the tense of 'to be' to the original tense.",
          "Writing 'The test was mark by the teacher' — past participle (marked) not plain form.",
          "Omitting 'by the teacher' when the question specifies a full passive transformation."
        ]
      },
      {
        question: "Punctuate the following correctly: 'however the students who had studied hard were not worried'",
        steps: [
          "Identify the sentence connective and add a comma after it.",
          "Identify the relative clause and determine whether it is restrictive or non-restrictive.",
          "Add appropriate commas around the relative clause if non-restrictive.",
          "Add a full stop at the end."
        ],
        solution: "'However, the students, who had studied hard, were not worried.' However = sentence connective → comma after. 'who had studied hard' = non-restrictive relative clause (it adds information, not identification) → enclosed in commas. Full stop at end.",
        commonErrors: [
          "No comma after 'however' — it is a conjunctive adverb and must be followed by a comma.",
          "No commas around 'who had studied hard' — the clause is parenthetical.",
          "Placing a semicolon before 'however' only (correct in some contexts) without commas around the clause."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Identifiseer die woordklas van elke onderstreepte woord en regverdig jou antwoord: 'Die ou man het vinnig na die rooi huis gehardloop.'",
        steps: [
          "Lys elke onderstreepte woord.",
          "Noem sy woordklas.",
          "Gee 'n rede vir elke klassifikasie."
        ],
        solution: "'ou' = byvoeglike naamwoord (verander die selfstandige naamwoord 'man'). 'vinnig' = bywoord (verander die werkwoord 'hardloop', antwoord 'hoe?'). 'na' = voorsetsel (toon ruimtelike verwantskap). 'rooi' = byvoeglike naamwoord (verander 'huis'). Strategie: vra watter vraag die woord beantwoord.",
        commonErrors: [
          "'Vinnig' as byvoeglike naamwoord klassifiseer — toets funksie, nie vorm nie.",
          "Voorsetsels en voegwoorde verwar.",
          "Regverdiging weglaat — identifikasie alleen verdien 1 punt; regverdiging verdien die tweede."
        ]
      },
      {
        question: "Herskryf die volgende aktiewe sin in die lydende vorm: 'Die onderwyser het die toets nagesien.'",
        steps: [
          "Identifiseer onderwerp, werkwoord en voorwerp.",
          "Maak die voorwerp die nuwe onderwerp.",
          "Verander die werkwoord na 'word/is/was' + verlede deelwoord.",
          "Voeg 'deur + agent' by indien nodig."
        ],
        solution: "Aktief: Die onderwyser (onderwerp) het nagesien (werkwoord) die toets (voorwerp). Nuwe onderwerp: 'die toets'. Werkwoord: 'is nagesien'. Agent: 'deur die onderwyser'. Lydend: 'Die toets is deur die onderwyser nagesien.'",
        commonErrors: [
          "Vergeet om die tyd van 'word/is/was' by die oorspronklike tyd aan te pas.",
          "Skryf 'nasiensien' eerder as die verlede deelwoord 'nagesien'.",
          "'Deur die onderwyser' weglaat wanneer die vraag 'n volledige omskrywing vereis."
        ]
      },
      {
        question: "Interpunkteer die volgende korrek: 'nogtans het die leerders wat hard geleer het nie bekommerd gewees nie'",
        steps: [
          "Identifiseer die sinverbinder en plaas 'n komma daarna.",
          "Identifiseer die betreklike bysin en besluit of dit nie-beperkend is.",
          "Voeg kommas om die bysin in as dit nie-beperkend is.",
          "Voeg 'n punt aan die einde."
        ],
        solution: "'Nogtans, het die leerders, wat hard geleer het, nie bekommerd gewees nie.' Nogtans = sinverbinder → komma daarna. 'wat hard geleer het' = nie-beperkende bysin → kommas omheen. Punt aan die einde.",
        commonErrors: [
          "Geen komma na 'Nogtans' nie.",
          "Geen kommas om 'wat hard geleer het' nie.",
          "Vergeet van die slotpunt."
        ]
      }
    ]
  },

  "AFRF-6": {
    workedExamplesEn: [
      {
        question: "Read a given Afrikaans passage and answer a 3-mark comprehension question requiring inference.",
        steps: [
          "Read the question carefully to determine exactly what is asked (fact or inference).",
          "Locate the relevant section of the passage (use the line reference if given).",
          "For inference: combine what is stated with what is implied; do not copy-paste.",
          "Write a complete sentence answer that directly responds to the question."
        ],
        solution: "Question: 'Waarom is Rina se afwesigheid by die vergadering opvallend?' (Why is Rina's absence from the meeting notable?) Passage states: Rina 'het nog nooit 'n vergadering gemis nie' (has never missed a meeting). Inference: her absence is noteworthy precisely because she is always present — something significant must have prevented her. Answer: 'Rina se afwesigheid is opvallend omdat sy nog altyd by elke vergadering teenwoordig was; haar afwesigheid dui aan dat iets ernstig gebeur het.'",
        commonErrors: [
          "Copying a sentence directly from the text instead of inferring.",
          "Writing a fragment instead of a complete sentence.",
          "Answering a different question than what was asked (not reading the question carefully enough)."
        ]
      },
      {
        question: "Write a 60–70 word summary of a given Afrikaans passage, covering 7 specified points.",
        steps: [
          "Read all 7 required points before starting.",
          "Locate and highlight where each point appears in the passage.",
          "Paraphrase each point — do not copy phrases directly.",
          "Write a connected paragraph of 60–70 words covering all 7 points.",
          "Count your words and adjust."
        ],
        solution: "Approach: map each of the 7 bullet points to a paraphrase. Sequence them logically. Use connectors ('Verder', 'Gevolglik', 'Ten slotte') to link ideas. Draft = 75 words → cut the least essential phrase. Final check: 68 words, all 7 points present, no direct copying from source.",
        commonErrors: [
          "Copying whole phrases from the passage — penalised for plagiarism.",
          "Writing fewer than 7 points — each missing point loses a mark.",
          "Exceeding 70 words without a penalty awareness — examiners mark up to word 70 only."
        ]
      },
      {
        question: "Identify and explain a literary device used in the following Afrikaans prose passage: 'Die stad het hom verslind soos 'n groot swart wals.'",
        steps: [
          "Name the literary device.",
          "Quote the relevant part of the sentence.",
          "Explain what is being compared/personified/described.",
          "State the effect on the reader."
        ],
        solution: "Device: simile ('vergelyking'). Quote: 'soos 'n groot swart wals'. The city is compared to a massive black roller. Effect: the comparison conveys the city as a crushing, unstoppable force that consumes the individual — it makes the protagonist's powerlessness viscerally concrete.",
        commonErrors: [
          "Naming 'metaphor' instead of 'simile' — 'soos/as' signals a simile.",
          "Only naming the device without quoting or explaining.",
          "Describing the image without stating its effect on the reader."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Lees 'n gegewe Afrikaanse gedeelte en beantwoord 'n 3-punt begripsouditievraag wat gevolgtrekking vereis.",
        steps: [
          "Lees die vraag om te bepaal of 'n feit of gevolgtrekking gevra word.",
          "Vind die relevante deel van die gedeelte.",
          "Kombineer wat gesê word met wat geïmpliseer word.",
          "Skryf 'n volledige sinantwoord."
        ],
        solution: "Vraag: 'Waarom is Rina se afwesigheid by die vergadering opvallend?' Gedeelte sê: Rina het 'nog nooit 'n vergadering gemis nie'. Gevolgtrekking: haar afwesigheid is opvallend juis omdat sy altyd teenwoordig is. Antwoord: 'Rina se afwesigheid is opvallend omdat sy nog altyd elke vergadering bygewoon het en haar afwesigheid dus 'n ernstige rede impliseer.'",
        commonErrors: [
          "Sin direk uit die teks kopieer.",
          "Fragment skryf in plaas van 'n volledige sin.",
          "'n Ander vraag beantwoord as wat gevra is."
        ]
      },
      {
        question: "Skryf 'n 60–70 woord opsomming van 'n gegewe Afrikaanse gedeelte met 7 gespesifiseerde punte.",
        steps: [
          "Lees al 7 vereiste punte voor jy begin.",
          "Vind en merk waar elke punt in die gedeelte verskyn.",
          "Parafraseer elke punt.",
          "Skryf 'n samehangende paragraaf van 60–70 woorde.",
          "Tel jou woorde en pas aan."
        ],
        solution: "Aanpak: karteer elk van die 7 punte na 'n parafrase. Rangskik logies. Gebruik verbindingsworde ('Verder', 'Gevolglik', 'Ten slotte'). Konsep = 75 woorde → sny die mins noodsaaklike frase. Finale kontrole: 68 woorde, al 7 punte teenwoordig, geen direkte kopiëring.",
        commonErrors: [
          "Frases direk uit die teks kopieer.",
          "Minder as 7 punte skryf.",
          "Meer as 70 woorde sonder bewustheid van straf skryf."
        ]
      },
      {
        question: "Identifiseer en verduidelik 'n styl- of beeldspraakfiguur in die Afrikaanse prosasin: 'Die stad het hom verslind soos 'n groot swart wals.'",
        steps: [
          "Noem die styl- of beeldspraakfiguur.",
          "Haal die relevante deel aan.",
          "Verduidelik wat vergelyk/vergestalt/beskryf word.",
          "Stel die effek op die leser."
        ],
        solution: "Figuur: vergelyking ('simile'). Aanhaling: 'soos 'n groot swart wals'. Die stad word vergelyk met 'n massiewe swart wals. Effek: die vergelyking stel die stad voor as 'n verpletterende, onkeerbare mag wat die individu verslind — dit maak die protagonis se magteloosheid lewendig konkreet.",
        commonErrors: [
          "Metafoor sê in plaas van vergelyking — 'soos/as' dui 'n vergelyking aan.",
          "Slegs die figuur noem sonder aanhaling of verduideliking.",
          "Die beeld beskryf sonder die effek op die leser te stel."
        ]
      }
    ]
  },

  "AFRF-7": {
    workedExamplesEn: [
      {
        question: "Write a well-structured argumentative essay (350–400 words) on the topic: 'Social media does more harm than good for teenagers.'",
        steps: [
          "Introduction (40–50 words): hook → context → clear thesis statement for OR against.",
          "Body paragraph 1: strongest argument + evidence/example + explanation.",
          "Body paragraph 2: second argument + evidence/example + explanation.",
          "Counter-argument paragraph: acknowledge the opposing view, then refute it.",
          "Conclusion (30–40 words): restate thesis in new words, summarise arguments, closing thought."
        ],
        solution: "Thesis: Social media causes more harm than good. Body 1: mental health — studies link heavy use to anxiety and depression in teenagers (comparison/FOMO). Body 2: cyberbullying — anonymous harassment has no precedent in pre-digital teen life. Counter: social media connects isolated youth — but the risks outweigh this benefit since safer connection methods exist. Conclusion: platforms must implement stronger safeguards, but until then, restrictions are justified. Word count: 385.",
        commonErrors: [
          "No clear thesis — the essay must take a definite position, not 'on one hand/on the other'.",
          "No counter-argument — examiners expect acknowledgment and refutation of the opposing view.",
          "Under 350 or over 400 words — both attract a penalty in some marking schemes."
        ]
      },
      {
        question: "Write a descriptive essay (350–400 words) describing a market scene vividly.",
        steps: [
          "Use all five senses: sight, sound, smell, taste, touch.",
          "Use figurative language (similes, metaphors, personification) in every paragraph.",
          "Organise spatially (near to far, or entrance to exit) rather than by topic.",
          "Use varied sentence lengths to control pace and rhythm.",
          "End with a reflective or sensory moment that gives the scene emotional resonance."
        ],
        solution: "Opening: 'The market breathes.' — personification sets tone immediately. Paragraph 2 (sight + sound): stalls draped in orange, yellow, green; vendors calling like competing orchestras. Paragraph 3 (smell + taste): cinnamon-dusted koeksisters, the sharp bite of atchar in the air. Paragraph 4 (touch + movement): the jostling crowd, a grandmother's elbow, a child's sticky hand reaching for a samosa. Closing: 'I leave full — not just in the stomach.' Figurative language: 4 similes, 2 metaphors, 1 personification.",
        commonErrors: [
          "Only describing sight — neglecting sound, smell, taste and touch.",
          "No figurative language — a purely factual description scores poorly.",
          "Organised by time ('first… then… finally') rather than spatially or sensorially."
        ]
      },
      {
        question: "Write a reflective essay (350–400 words) on a moment that changed your perspective.",
        steps: [
          "Identify a specific, personal moment (not a general observation).",
          "Describe the moment concretely before shifting to reflection.",
          "Use first-person voice throughout.",
          "Show — don't just tell — how your thinking changed.",
          "End with an insight or question rather than a tidy resolution."
        ],
        solution: "Opening: Specific moment — the author's grandmother's hands kneading bread dough. Concrete description: flour dust, the rhythmic thud, the smell of yeast. Pivot: realisation that she had done this every Friday for sixty years — a life of repetition as a form of love. Reflection: 'I had mistaken the ordinary for the unimportant.' Closing insight: What else have I dismissed as routine that is, in fact, devotion?",
        commonErrors: [
          "Writing a general philosophical musing rather than a specific personal moment.",
          "Telling the reader 'I changed' without showing the change through detail.",
          "Ending with a clichéd moral ('this taught me that family is everything') instead of a genuine insight."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Skryf 'n gestruktureerde argumenterende opstel (350–400 woorde) oor: 'Sosiale media doen meer skade as goed vir tieners.'",
        steps: [
          "Inleiding: haak → konteks → duidelike stelling vir of teen.",
          "Liggaam 1: sterkste argument + bewys + verduideliking.",
          "Liggaam 2: tweede argument + bewys + verduideliking.",
          "Teenargument: erken die teenoorgestelde siening, weerlê dit dan.",
          "Slot: herhaal stelling in nuwe woorde, vat saam, slotgedagte."
        ],
        solution: "Stelling: Sosiale media veroorsaak meer skade. Liggaam 1: geestesgesondheid — studies koppel swaar gebruik aan angs en depressie. Liggaam 2: kuberboelie — anonieme teistering het geen presedent in voor-digitale tienerjare. Teenargument: sosiale media verbind geïsoleerde jeug — maar risiko's oortref hierdie voordeel. Slot: Platforms moet sterker beskerming implementeer. Woordtelling: 385.",
        commonErrors: [
          "Geen duidelike stelling nie.",
          "Geen teenargument nie.",
          "Onder 350 of bo 400 woorde."
        ]
      },
      {
        question: "Skryf 'n beskrywende opstel (350–400 woorde) wat 'n marktoneel lewendig beskryf.",
        steps: [
          "Gebruik al vyf sintuie.",
          "Gebruik beeldspraak in elke paragraaf.",
          "Organiseer ruimtelik eerder as per onderwerp.",
          "Gebruik gevarieerde sinlengtes.",
          "Sluit af met 'n reflektiewe of sensorieuse oomblik."
        ],
        solution: "Opening: 'Die mark asem.' — verpersoonliking stel toon onmiddellik. Par. 2 (sig + klank): stalletjies in oranje en groen; venters roep soos mededingende orkeste. Par. 3 (reuk + smaak): kaneel-koeksisters, die skerp byt van atchar. Par. 4 (aanraking): die dringende skare, 'n kleinkind se klewerige hand. Slot: 'Ek verlaat vol — nie net in die maag nie.'",
        commonErrors: [
          "Slegs sig beskryf.",
          "Geen beeldspraak nie.",
          "Chronologies eerder as ruimtelik georganiseer."
        ]
      },
      {
        question: "Skryf 'n reflektiewe opstel (350–400 woorde) oor 'n oomblik wat jou perspektief verander het.",
        steps: [
          "Identifiseer 'n spesifieke, persoonlike oomblik.",
          "Beskryf die oomblik konkreet voor jy reflekteer.",
          "Gebruik eerste persoon deurlopend.",
          "Wys — moenie net sê — hoe jou denke verander het.",
          "Sluit met 'n insig of vraag eerder as 'n netjiese oplossing."
        ],
        solution: "Opening: Grootmoeder se hande wat brood knie. Konkrete beskrywing: meelstof, ritmiese klop, gisreuk. Swaai: besef sy het dit elke Vrydag ses dekades lank gedoen — herhaling as liefdesvorm. Refleksie: 'Ek het die gewone vir die onbelangrike aangesien.' Slotinsig: Wat het ek nog as roetine afgedoen wat eintlik toewyding is?",
        commonErrors: [
          "Algemene filosofiese peinsing eerder as 'n spesifieke persoonlike oomblik skryf.",
          "Die verandering sê sonder dit deur besonderhede te wys.",
          "Met 'n clichématige moraal eindig."
        ]
      }
    ]
  },

  "AFRF-8": {
    workedExamplesEn: [
      {
        question: "Write a formal letter of complaint (120–150 words) to a municipality about poor service delivery.",
        steps: [
          "Sender's address and date (top right).",
          "Recipient's address (left, below date).",
          "Formal salutation: 'Dear Sir/Madam' or named official.",
          "Body: state the complaint clearly, provide evidence, state desired action.",
          "Formal closing: 'Yours faithfully' (unknown recipient) or 'Yours sincerely' (known name).",
          "Signature and printed name."
        ],
        solution: "23 Rose Street, Bellville, 7530 | 25 May 2026 || The Municipal Manager, City of Cape Town || Dear Sir/Madam, || I write to complain about the absence of refuse collection on Elm Street for the past three weeks (16 April – 7 May 2026). The resulting accumulation poses a serious health risk. I request immediate collection and a written explanation of the cause of the delay. || Yours faithfully, | A. Mouton",
        commonErrors: [
          "Using 'Yours sincerely' with 'Dear Sir/Madam' — sincerely is only for named recipients.",
          "Omitting the sender's address or date.",
          "Writing informally (contractions, emojis, slang) in a formal letter."
        ]
      },
      {
        question: "Write a newspaper report (120–150 words) on a school science fair.",
        steps: [
          "Headline: short, attention-grabbing, present tense.",
          "Lead paragraph: answer Who, What, Where, When in 1–2 sentences.",
          "Body: key details, quotes from participants or organisers.",
          "Closing: future angle or concluding remark.",
          "Use third-person, objective tone."
        ],
        solution: "Headline: 'Westridge Science Fair Dazzles Hundreds' || Lead: Over 400 learners and parents attended the annual Westridge High School Science Fair held on 24 May 2026 in the school hall. || Body: Thirty-two projects were exhibited, ranging from water filtration models to AI chatbot demonstrations. 'This is the highest standard we have seen,' said principal Mrs L. Adams. Grade 10 learner Amahle Zulu won first prize for her solar-powered water purifier. || Closing: The winning projects will be submitted to the regional competition in June.",
        commonErrors: [
          "Writing in first person ('I attended…') — reports use third person.",
          "No headline or a question-form headline ('Did the Fair Succeed?').",
          "Missing the 5Ws in the lead paragraph."
        ]
      },
      {
        question: "Write a diary entry (120–150 words) expressing complex emotions about a difficult decision.",
        steps: [
          "Date and salutation: 'Dear Diary,' or just the date.",
          "Write in first person, informal but introspective register.",
          "Express emotions directly (state the feeling AND the reason).",
          "Include internal conflict — show uncertainty, not resolution.",
          "End with a question, hope, or unresolved thought."
        ],
        solution: "25 May 2026 | Dear Diary, || Today I told my best friend I couldn't lend her the money she needed. I know she was counting on me. The relief I felt the moment I said 'no' was immediate — and then the guilt arrived, right behind it, like a shadow. She said she understood. I don't know if I believe her. I keep telling myself that I can't afford it, that I have my own rent to pay. But 'I can't afford it' and 'I chose not to' feel different in the chest. Tonight I just feel small. || Maybe tomorrow will make more sense.",
        commonErrors: [
          "Writing a factual account without emotional reflection.",
          "Formal register — diary language should be personal and intimate.",
          "A tidy, resolved ending — diary entries are honest about ongoing uncertainty."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Skryf 'n formele klagte brief (120–150 woorde) aan 'n munisipaliteit oor swak dienslewering.",
        steps: [
          "Skrywer se adres en datum (bo regs).",
          "Ontvanger se adres (links, onder datum).",
          "Formele aanhef: 'Geagte Meneer/Mevrou' of amptenaar se naam.",
          "Liggaam: stel klagte duidelik, verskaf bewys, stel verlangde optrede.",
          "Formele slotgroet: 'Die uwe' (onbekende ontvanger).",
          "Handtekening en gedrukte naam."
        ],
        solution: "Rosestraat 23, Bellville, 7530 | 25 Mei 2026 || Die Munisipale Bestuurder, Stad Kaapstad || Geagte Meneer/Mevrou, || Ek skryf om te kla oor die afwesigheid van vullisversameling in Olmstraat vir die afgelope drie weke (16 April – 7 Mei 2026). Die gevolglike ophoping hou 'n ernstige gesondheidsrisiko in. Ek versoek onmiddellike versameling en 'n skriftelike verduideliking. || Die uwe, | A. Mouton",
        commonErrors: [
          "'Vriendelik die uwe' met 'Geagte Meneer/Mevrou' gebruik — slegs vir benoemde ontvangers.",
          "Skrywer se adres of datum weglaat.",
          "Informele register in 'n formele brief gebruik."
        ]
      },
      {
        question: "Skryf 'n koerantberig (120–150 woorde) oor 'n skoolvakkundige skou.",
        steps: [
          "Opskrif: kort, aandagtrekkend, teenwoordige tyd.",
          "Inleidende paragraaf: beantwoord Wie, Wat, Waar, Wanneer.",
          "Liggaam: sleutelbesonderhede, aanhalings.",
          "Slot: toekomstige hoek of slotopmerking.",
          "Gebruik derde persoon, objektiewe toon."
        ],
        solution: "Opskrif: 'Wesrif Vakkundige Skou Betower Honderde' || Inleiding: Meer as 400 leerders en ouers het die jaarlikse Wesrif Hoërskool Vakkundige Skou op 24 Mei 2026 in die skoulsaal bygewoon. || Liggaam: Twee-en-dertig projekte is uitgestal. 'Dit is die hoogste standaard wat ons nog gesien het,' het hoof Mnr. L. Adams gesê. Gr. 10-leerder Amahle Zulu het eerste prys gewen vir haar sonkrag-waterzuiweraar. || Slot: Die wenprojekte sal in Junie na die streekskompetisie ingedien word.",
        commonErrors: [
          "In eerste persoon skryf.",
          "Geen opskrif of 'n opskrif as vraag.",
          "Die 5W's in die inleidende paragraaf weglaat."
        ]
      },
      {
        question: "Skryf 'n dagboekinskrywing (120–150 woorde) wat komplekse emosies oor 'n moeilike besluit uitdruk.",
        steps: [
          "Datum en aanhef.",
          "Eerste persoon, informele maar introspektiewe register.",
          "Druk emosies direk uit.",
          "Sluit interne konflik in.",
          "Eindig met 'n vraag, hoop of onopgeloste gedagte."
        ],
        solution: "25 Mei 2026 | Liewe Dagboek, || Vandag het ek my beste vriendin gesê ek kan nie die geld leen nie. Sy het op my gesteun. Die verligting was onmiddellik — en toe kom die skuld, soos 'n skaduwee agterna. Sy sê sy verstaan. Ek weet nie of ek haar glo nie. Ek sê vir myself ek kan dit nie bekostig nie. Maar 'ek kan nie' en 'ek het nie' voel anders in die bors. Vanaand voel ek net klein. || Miskien sal môre meer sin maak.",
        commonErrors: [
          "Feitlike verslag skryf sonder emosionele refleksie.",
          "Formele register gebruik.",
          "'n Netjiese, opgeloste einde skryf."
        ]
      }
    ]
  },

  // ===================== INFORMATION TECHNOLOGY (IT) =====================

  "IT-1": {
    workedExamplesEn: [
      {
        question: "Explain the difference between system software and application software with two examples of each.",
        steps: [
          "Define system software and state its role.",
          "Give two examples of system software.",
          "Define application software and state its role.",
          "Give two examples of application software."
        ],
        solution: "System software: software that manages and operates the computer hardware, providing a platform for other software. Examples: Windows 11 (operating system), device drivers (e.g. printer driver). Application software: programs designed for end users to perform specific tasks. Examples: Microsoft Word (word processing), Google Chrome (web browser).",
        commonErrors: [
          "Listing antivirus as application software — it is a utility (system software).",
          "Confusing the OS with hardware.",
          "No examples given — definitions alone do not earn full marks."
        ]
      },
      {
        question: "Draw and label the systems development life cycle (SDLC) showing at least 5 phases.",
        steps: [
          "List the phases in correct order.",
          "For each phase, state its primary activity.",
          "Show that the cycle is iterative (loops back)."
        ],
        solution: "Phases in order: 1. Analysis — identify the problem and requirements. 2. Design — plan the system structure and interfaces. 3. Implementation — write and assemble the code. 4. Testing — find and fix errors. 5. Deployment — release to users. 6. Maintenance — update and improve. The cycle iterates: maintenance findings feed back into analysis.",
        commonErrors: [
          "Listing fewer than 5 phases when the question specifies 5.",
          "Confusing 'analysis' (what the system must do) with 'design' (how it will do it).",
          "Presenting the SDLC as a straight line rather than a cycle."
        ]
      },
      {
        question: "What is the difference between a compiler and an interpreter? Give an advantage of each.",
        steps: [
          "Define compiler.",
          "State one advantage of compilation.",
          "Define interpreter.",
          "State one advantage of interpretation."
        ],
        solution: "Compiler: translates the entire source code into machine code at once before execution. Advantage: the compiled program runs faster because translation is done beforehand. Interpreter: translates and executes source code line by line at runtime. Advantage: easier debugging — errors are reported immediately on the problematic line.",
        commonErrors: [
          "Saying a compiler 'runs' code — it translates; the CPU runs the resulting machine code.",
          "Confusing interpreter (line by line) with assembler (assembly language → machine code).",
          "No advantage stated — definition alone loses 1 mark."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die verskil tussen stelselsagteware en toepassingsagteware met twee voorbeelde van elk.",
        steps: [
          "Definieer stelselsagteware en stel sy rol.",
          "Gee twee voorbeelde van stelselsagteware.",
          "Definieer toepassingsagteware en stel sy rol.",
          "Gee twee voorbeelde van toepassingsagteware."
        ],
        solution: "Stelselsagteware: sagteware wat die rekenaarhardware bestuur en 'n platform vir ander sagteware bied. Voorbeelde: Windows 11, drywers (bv. drukkerdrywe). Toepassingsagteware: programme vir eindgebruikers vir spesifieke take. Voorbeelde: Microsoft Word, Google Chrome.",
        commonErrors: [
          "Antivirussagteware as toepassingsagteware lys — dit is 'n hulpprogram.",
          "Die OS met hardeware verwar.",
          "Geen voorbeelde gee nie."
        ]
      },
      {
        question: "Teken en etiketteer die stelsels-ontwikkelingslewensiklus (SDLC) met ten minste 5 fases.",
        steps: [
          "Lys die fases in korrekte volgorde.",
          "Stel vir elke fase die primêre aktiwiteit.",
          "Wys dat die siklus iteratief is."
        ],
        solution: "Fases: 1. Analise — identifiseer die probleem en vereistes. 2. Ontwerp — beplan struktuur en koppelvlakke. 3. Implementering — skryf en stel kode saam. 4. Toetsing — vind en herstel foute. 5. Ontplooiing — vrystel aan gebruikers. 6. Instandhouding — opdateer en verbeter. Die siklus itereer: instandhouding voed terug na analise.",
        commonErrors: [
          "Minder as 5 fases lys.",
          "'Analise' (wat) met 'ontwerp' (hoe) verwar.",
          "Die SDLC as 'n reguit lyn aanbied."
        ]
      },
      {
        question: "Wat is die verskil tussen 'n samesteller en 'n vertolker? Gee 'n voordeel van elk.",
        steps: [
          "Definieer samesteller.",
          "Stel een voordeel van samestelling.",
          "Definieer vertolker.",
          "Stel een voordeel van vertolking."
        ],
        solution: "Samesteller: vertaal die volledige bronkode in masjiencode voor uitvoering. Voordeel: die saamgestelde program loop vinniger. Vertolker: vertaal en voer bronkode reël vir reël tydens looptyd uit. Voordeel: makliker ontfouting — foute word onmiddellik op die problematiese reël gerapporteer.",
        commonErrors: [
          "Sê 'n samesteller 'loop' kode.",
          "Vertolker (reël vir reël) met samesteller (monteerderaal → masjiencode) verwar.",
          "Geen voordeel stel nie."
        ]
      }
    ]
  },

  "IT-2": {
    workedExamplesEn: [
      {
        question: "Explain the function of RAM and ROM in a computer system and state one key difference.",
        steps: [
          "Define RAM and explain its function.",
          "Define ROM and explain its function.",
          "State one key difference."
        ],
        solution: "RAM (Random Access Memory): volatile primary storage that holds data and programs currently in use. When power is off, RAM is erased. ROM (Read-Only Memory): non-volatile memory that permanently stores firmware (e.g. the BIOS boot instructions). Key difference: RAM is volatile (data lost on power-off); ROM is non-volatile (data permanently retained).",
        commonErrors: [
          "Stating ROM stores user files — ROM stores firmware, not user data.",
          "Calling RAM 'hard drive space' — RAM is internal primary memory, not secondary storage.",
          "No difference stated."
        ]
      },
      {
        question: "List three input devices and three output devices, and classify each as hardware.",
        steps: [
          "Name three input devices.",
          "Explain briefly what each inputs.",
          "Name three output devices.",
          "Explain briefly what each outputs."
        ],
        solution: "Input: keyboard (text/commands), mouse (pointer position/clicks), microphone (audio). Output: monitor (visual display), printer (hard-copy documents), speakers (audio). All six are hardware — physical components of the computer system.",
        commonErrors: [
          "Listing software as a device.",
          "Confusing a touchscreen (both input AND output) — it is a dual-purpose device.",
          "Missing the explanation of what the device inputs/outputs."
        ]
      },
      {
        question: "Compare magnetic hard disk drives (HDDs) and solid-state drives (SSDs) in terms of speed, durability and cost.",
        steps: [
          "State the speed comparison.",
          "State the durability comparison.",
          "State the cost comparison.",
          "Give a conclusion on when each is preferred."
        ],
        solution: "Speed: SSDs are significantly faster (no mechanical moving parts; reads/writes measured in GB/s vs HDDs at 100–200 MB/s). Durability: SSDs are more durable (no spinning platter; resistant to drops/vibration). Cost: HDDs are cheaper per gigabyte. Conclusion: SSDs preferred for OS/application drives; HDDs preferred for bulk storage on a budget.",
        commonErrors: [
          "Saying HDDs are faster — they are slower due to mechanical read/write heads.",
          "Claiming SSDs have unlimited write cycles — they have a finite write endurance.",
          "No conclusion on appropriate use case."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die funksie van RAM en ROM in 'n rekenaarstelsel en stel een sleutelverskil.",
        steps: [
          "Definieer RAM en verduidelik sy funksie.",
          "Definieer ROM en verduidelik sy funksie.",
          "Stel een sleutelverskil."
        ],
        solution: "RAM (Ewekansige Toegangsgeheue): vlugtige primêre berging wat data en programme in gebruik hou. Wanneer krag af is, word RAM uitgewis. ROM (Leesgeheue): nie-vlugtige geheue wat firmware permanent stoor (bv. BIOS-aanskakelinstruksies). Sleutelverskil: RAM is vlugtig; ROM is nie-vlugtig.",
        commonErrors: [
          "Sê ROM stoor gebruikerslêers.",
          "RAM 'hardeskyf-spasie' noem.",
          "Geen verskil stel nie."
        ]
      },
      {
        question: "Lys drie invoerapparate en drie uitvoeraapprate en klassifiseer elk as hardeware.",
        steps: [
          "Noem drie invoerapparate.",
          "Verduidelik wat elkeen invoer.",
          "Noem drie uitvoeraapprate.",
          "Verduidelik wat elkeen uitvoer."
        ],
        solution: "Invoer: sleutelbord (teks/opdragte), muis (wyserposisie/kliks), mikrofoon (oudio). Uitvoer: monitor (visuele vertoning), drukker (hardekopieer dokumente), luidsprekers (oudio). Almal is hardeware — fisiese komponente van die rekenaarstelsel.",
        commonErrors: [
          "Sagteware as 'n apparaat lys.",
          "Aanraakskerm verwar — dit is beide invoer EN uitvoer.",
          "Verduideliking van wat die apparaat invoer/uitvoer weglaat."
        ]
      },
      {
        question: "Vergelyk magnetiese hardeskywe (HDD's) en vastestaat-skyfies (SSD's) ten opsigte van spoed, duursaamheid en koste.",
        steps: [
          "Stel die spoedvergelyking.",
          "Stel die duursaamheidvergelyking.",
          "Stel die koste-vergelyking.",
          "Gee 'n gevolgtrekking."
        ],
        solution: "Spoed: SSD's is aansienlik vinniger (geen meganiese bewegende dele; lees/skryf gemeet in GB/s vs HDD's teen 100–200 MB/s). Duursaamheid: SSD's is duursamer (geen draaiende skyf). Koste: HDD's is goedkoper per gigagreep. Gevolgtrekking: SSD's verkies vir OS; HDD's vir grootmaat berging teen 'n begroting.",
        commonErrors: [
          "Sê HDD's is vinniger.",
          "Beweer SSD's het onbeperkte skryfsiklusse.",
          "Geen gevolgtrekking oor gepaste gebruiksgeval."
        ]
      }
    ]
  },

  "IT-3": {
    workedExamplesEn: [
      {
        question: "Explain how a client-server network differs from a peer-to-peer network, with an advantage and disadvantage of each.",
        steps: [
          "Define client-server and explain data flow.",
          "State one advantage and one disadvantage of client-server.",
          "Define peer-to-peer and explain data flow.",
          "State one advantage and one disadvantage of peer-to-peer."
        ],
        solution: "Client-server: a central server manages resources; clients request services from it. Advantage: centralised management and security. Disadvantage: expensive to set up and maintain; single point of failure. Peer-to-peer: each computer acts as both client and server. Advantage: cheap and easy to set up. Disadvantage: no central control — security is difficult to enforce.",
        commonErrors: [
          "Calling the internet a peer-to-peer network — it uses a client-server model.",
          "Stating both have the same security level — client-server is more secure.",
          "No disadvantage mentioned."
        ]
      },
      {
        question: "Explain the purpose of each layer in the TCP/IP four-layer model.",
        steps: [
          "Name the four layers in order.",
          "State the function of each layer in one sentence."
        ],
        solution: "1. Network Access (Link) layer: handles physical transmission of data over a specific network medium (Ethernet, Wi-Fi). 2. Internet layer: routes packets across networks using IP addresses. 3. Transport layer: ensures reliable, ordered delivery using TCP (or fast but unreliable delivery using UDP). 4. Application layer: provides protocols for user applications (HTTP, FTP, SMTP, DNS).",
        commonErrors: [
          "Confusing TCP/IP with the OSI 7-layer model — TCP/IP has 4 layers.",
          "Placing HTTP at the transport layer — it is an application layer protocol.",
          "Describing TCP/IP as a single protocol — it is a suite of protocols."
        ]
      },
      {
        question: "What is an IP address? Explain the difference between IPv4 and IPv6.",
        steps: [
          "Define IP address and its purpose.",
          "Describe IPv4 format.",
          "Describe IPv6 format.",
          "State why IPv6 was developed."
        ],
        solution: "IP address: a unique numerical label assigned to each device on a network, used for identification and routing. IPv4: 32-bit address, written as 4 octets (e.g. 192.168.1.1) — supports ~4.3 billion addresses. IPv6: 128-bit address, written in hexadecimal groups (e.g. 2001:0db8:85a3::8a2e:0370:7334) — supports 3.4 × 10³⁸ addresses. IPv6 developed because IPv4 addresses are nearly exhausted globally.",
        commonErrors: [
          "Confusing IP address (logical, software) with MAC address (physical, hardware).",
          "Stating IPv4 is 128-bit — it is 32-bit.",
          "No reason given for IPv6 development."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik hoe 'n kliënt-bedienernetwerk van 'n eweknie-netwerk verskil, met 'n voordeel en nadeel van elk.",
        steps: [
          "Definieer kliënt-bediener en verduidelik datavloei.",
          "Stel een voordeel en een nadeel van kliënt-bediener.",
          "Definieer eweknie en verduidelik datavloei.",
          "Stel een voordeel en een nadeel van eweknie."
        ],
        solution: "Kliënt-bediener: 'n sentrale bediener bestuur hulpbronne; kliënte versoek dienste. Voordeel: gesentraliseerde bestuur en sekuriteit. Nadeel: duur om op te stel. Eweknie: elke rekenaar tree op as beide kliënt en bediener. Voordeel: goedkoop en maklik. Nadeel: geen sentrale beheer — sekuriteit moeilik om af te dwing.",
        commonErrors: [
          "Die internet 'n eweknie-netwerk noem.",
          "Sê albei het dieselfde sekuriteitsvlak.",
          "Geen nadeel noem nie."
        ]
      },
      {
        question: "Verduidelik die doel van elke laag in die TCP/IP vier-laag model.",
        steps: [
          "Noem die vier lae in volgorde.",
          "Stel die funksie van elke laag in een sin."
        ],
        solution: "1. Netwerktoegangslaag: hanteer fisiese oordrag van data. 2. Internetlaag: stuur pakkette oor netwerke met behulp van IP-adresse. 3. Vervoerlaag: verseker betroubare, geordende lewering via TCP (of vinnige maar onbetroubare via UDP). 4. Toepassingslaag: verskaf protokolle vir gebruikerstoepassings (HTTP, FTP, SMTP, DNS).",
        commonErrors: [
          "TCP/IP met die OSI 7-laag model verwar.",
          "HTTP by die vervoerlaag plaas.",
          "TCP/IP as 'n enkele protokol beskryf."
        ]
      },
      {
        question: "Wat is 'n IP-adres? Verduidelik die verskil tussen IPv4 en IPv6.",
        steps: [
          "Definieer IP-adres en sy doel.",
          "Beskryf IPv4-formaat.",
          "Beskryf IPv6-formaat.",
          "Stel waarom IPv6 ontwikkel is."
        ],
        solution: "IP-adres: 'n unieke numeriese etiket aan elke toestel op 'n netwerk toegeken. IPv4: 32-bis adres, geskryf as 4 oktette (bv. 192.168.1.1) — ondersteun ~4.3 miljard adresse. IPv6: 128-bis adres in heksadesimale groepe — ondersteun 3.4 × 10³⁸ adresse. IPv6 ontwikkel omdat IPv4-adresse wêreldwyd feitlik uitgeput is.",
        commonErrors: [
          "IP-adres (logies, sagteware) met MAC-adres (fisies, hardeware) verwar.",
          "Sê IPv4 is 128-bis.",
          "Geen rede vir IPv6-ontwikkeling gee nie."
        ]
      }
    ]
  },

  "IT-4": {
    workedExamplesEn: [
      {
        question: "Write valid HTML5 and CSS to display a red heading 'Welcome to IT' and a blue paragraph 'Grade 12 Computer Science'.",
        steps: [
          "Write the HTML5 boilerplate (DOCTYPE, html, head, body tags).",
          "Add an h1 tag with the heading text.",
          "Add a p tag with the paragraph text.",
          "Write CSS to colour the heading red and paragraph blue."
        ],
        solution: "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><title>IT Page</title><style>h1{color:red;}p{color:blue;}</style></head><body><h1>Welcome to IT</h1><p>Grade 12 Computer Science</p></body></html>",
        commonErrors: [
          "Forgetting DOCTYPE — required for valid HTML5.",
          "Writing 'color:red' inside the HTML tag instead of in a style block or external CSS.",
          "Closing tags incorrectly (</p> written as <p/>) — HTML5 uses separate open and close tags."
        ]
      },
      {
        question: "Explain the term 'e-commerce' and give two advantages and two disadvantages for consumers.",
        steps: [
          "Define e-commerce.",
          "State two advantages for consumers.",
          "State two disadvantages for consumers."
        ],
        solution: "E-commerce: buying and selling of goods and services over the internet. Advantages: 24/7 shopping convenience; access to global markets and competitive pricing. Disadvantages: cannot physically inspect products before purchase; risk of fraud and identity theft.",
        commonErrors: [
          "Stating advantages for businesses instead of consumers.",
          "Only one advantage or disadvantage given when two are asked.",
          "Confusing e-commerce with e-banking."
        ]
      },
      {
        question: "Describe three threats to internet security and one countermeasure for each.",
        steps: [
          "Name threat 1 → countermeasure.",
          "Name threat 2 → countermeasure.",
          "Name threat 3 → countermeasure."
        ],
        solution: "1. Phishing: criminals send fake emails to steal login credentials → Countermeasure: user training, spam filters, two-factor authentication. 2. Ransomware: malware encrypts files and demands payment → Countermeasure: regular backups, up-to-date antivirus. 3. Man-in-the-middle attack: attacker intercepts communication between two parties → Countermeasure: use HTTPS/TLS encrypted connections.",
        commonErrors: [
          "Listing a virus as a threat without explaining what it does.",
          "No countermeasure given — threats alone earn only half marks.",
          "Confusing phishing (social engineering) with pharming (DNS poisoning)."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Skryf geldige HTML5 en CSS om 'n rooi opskrif 'Welkom by IT' en 'n blou paragraaf 'Graad 12 Rekenaarwetenskap' te vertoon.",
        steps: [
          "Skryf die HTML5-raamwerk.",
          "Voeg 'n h1-tag met die opskrifteks by.",
          "Voeg 'n p-tag met die paragraafteks by.",
          "Skryf CSS om die opskrif rooi en paragraaf blou te kleur."
        ],
        solution: "<!DOCTYPE html><html lang='af'><head><meta charset='UTF-8'><title>IT Bladsy</title><style>h1{color:red;}p{color:blue;}</style></head><body><h1>Welkom by IT</h1><p>Graad 12 Rekenaarwetenskap</p></body></html>",
        commonErrors: [
          "DOCTYPE vergeet.",
          "'color:red' binne die HTML-tag skryf.",
          "Sluitlabels verkeerd sluit."
        ]
      },
      {
        question: "Verduidelik die term 'e-handel' en gee twee voordele en twee nadele vir verbruikers.",
        steps: [
          "Definieer e-handel.",
          "Stel twee voordele vir verbruikers.",
          "Stel twee nadele vir verbruikers."
        ],
        solution: "E-handel: koop en verkoop van goedere en dienste oor die internet. Voordele: 24/7 inkopiesgemak; toegang tot wêreldmarkte en mededingende pryse. Nadele: kan produkte nie fisies inspekteer voor aankoop nie; risiko van bedrog en identiteitsdiefstal.",
        commonErrors: [
          "Voordele vir besighede in plaas van verbruikers stel.",
          "Slegs een voordeel of nadeel gee.",
          "E-handel met e-bankwese verwar."
        ]
      },
      {
        question: "Beskryf drie bedreigings vir internetsekuriteit en een teenmaatreël vir elk.",
        steps: [
          "Noem bedreiging 1 → teenmaatreël.",
          "Noem bedreiging 2 → teenmaatreël.",
          "Noem bedreiging 3 → teenmaatreël."
        ],
        solution: "1. Uitvissing: misdadigers stuur vals e-pos om aanmeldbewyse te steel → Teenmaatreël: gebruikersopleiding, strooiposfilters, twee-faktor-verifikasie. 2. Losprysware: wanware enkripteer lêers en eis betaling → Teenmaatreël: gereelde rugsteun, bygewerkte antivirusprogrammatuur. 3. Man-in-die-middel aanval: aanvaller onderskep kommunikasie → Teenmaatreël: gebruik HTTPS/TLS-geënkripteerde verbindings.",
        commonErrors: [
          "'n Virus as bedreiging lys sonder om te verduidelik wat dit doen.",
          "Geen teenmaatreël gee nie.",
          "Uitvissing (sosiale ingenieurswese) met pharming (DNS-vergiftiging) verwar."
        ]
      }
    ]
  },

  "IT-5": {
    workedExamplesEn: [
      {
        question: "In Java, define a class 'Student' with private fields 'name' (String) and 'mark' (int), a constructor, and getter/setter methods.",
        steps: [
          "Declare the class with private fields.",
          "Write a parameterised constructor.",
          "Write a getter and setter for each field.",
          "Demonstrate encapsulation by keeping fields private."
        ],
        solution: "public class Student {\n  private String name;\n  private int mark;\n  public Student(String name, int mark) {\n    this.name = name;\n    this.mark = mark;\n  }\n  public String getName() { return name; }\n  public void setName(String name) { this.name = name; }\n  public int getMark() { return mark; }\n  public void setMark(int mark) { this.mark = mark; }\n}",
        commonErrors: [
          "Declaring fields as 'public' — this breaks encapsulation.",
          "Forgetting 'this.' in the constructor — without it, the parameter doesn't assign to the field.",
          "Writing getter as 'get name()' instead of 'getName()' — Java convention requires camelCase."
        ]
      },
      {
        question: "Explain inheritance in OOP and write a Java example showing a subclass 'Learner' extending 'Person'.",
        steps: [
          "Define inheritance.",
          "Write the parent class 'Person' with one field and a method.",
          "Write the child class 'Learner' using 'extends', adding one new field.",
          "Show the child calling the parent method."
        ],
        solution: "Inheritance: a subclass inherits attributes and methods from its parent class. class Person { String name; void greet(){ System.out.println('Hello, ' + name); } } class Learner extends Person { int grade; } // Usage: Learner l = new Learner(); l.name='Ama'; l.grade=12; l.greet(); // outputs 'Hello, Ama'",
        commonErrors: [
          "Using 'implements' instead of 'extends' for class inheritance.",
          "Redeclaring 'name' in the Learner class — it is inherited from Person.",
          "Confusing inheritance with composition (has-a) — inheritance is 'is-a'."
        ]
      },
      {
        question: "What is polymorphism? Give an example using method overriding in Java.",
        steps: [
          "Define polymorphism.",
          "Write a parent class with a method.",
          "Write a child class that overrides that method.",
          "Show how the same reference produces different output depending on the object."
        ],
        solution: "Polymorphism: the same method name behaves differently depending on the object it is called on. class Animal { void sound(){ System.out.println('...'); } } class Dog extends Animal { @Override void sound(){ System.out.println('Woof'); } } class Cat extends Animal { @Override void sound(){ System.out.println('Meow'); } } Animal a = new Dog(); a.sound(); // 'Woof'",
        commonErrors: [
          "Confusing overriding (same signature, different class) with overloading (same name, different parameters).",
          "Forgetting @Override annotation — not required but best practice.",
          "Creating a new Animal() directly and expecting Dog behaviour — the object type determines the method."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Definieer in Java 'n klas 'Leerder' met private velde 'naam' (String) en 'punt' (int), 'n konstrukteur en getter/setter-metodes.",
        steps: [
          "Verklaar die klas met private velde.",
          "Skryf 'n geparameteriseerde konstrukteur.",
          "Skryf 'n getter en setter vir elke veld.",
          "Demonstreer inkapseling deur velde privaat te hou."
        ],
        solution: "public class Leerder {\n  private String naam;\n  private int punt;\n  public Leerder(String naam, int punt) {\n    this.naam = naam;\n    this.punt = punt;\n  }\n  public String getNaam() { return naam; }\n  public void setNaam(String naam) { this.naam = naam; }\n  public int getPunt() { return punt; }\n  public void setPunt(int punt) { this.punt = punt; }\n}",
        commonErrors: [
          "Velde as 'public' verklaar.",
          "'this.' in die konstrukteur vergeet.",
          "Getter as 'get naam()' in plaas van 'getNaam()' skryf."
        ]
      },
      {
        question: "Verduidelik erfenis in OOP en skryf 'n Java-voorbeeld wat 'n subklas 'Leerder' toon wat 'Persoon' verleng.",
        steps: [
          "Definieer erfenis.",
          "Skryf die ouer-klas 'Persoon' met een veld en een metode.",
          "Skryf die kind-klas 'Leerder' met 'extends'.",
          "Wys die kind wat die ouer-metode aanroep."
        ],
        solution: "Erfenis: 'n subklas erf eienskappe en metodes van sy ouer-klas. class Persoon { String naam; void groet(){ System.out.println('Hallo, ' + naam); } } class Leerder extends Persoon { int graad; } // Gebruik: Leerder l = new Leerder(); l.naam='Ama'; l.graad=12; l.groet();",
        commonErrors: [
          "'implements' in plaas van 'extends' gebruik.",
          "'naam' in die Leerder-klas herdverklaar.",
          "Erfenis met komposisie verwar."
        ]
      },
      {
        question: "Wat is polimorfisme? Gee 'n voorbeeld deur metode-oorheersing in Java.",
        steps: [
          "Definieer polimorfisme.",
          "Skryf 'n ouer-klas met 'n metode.",
          "Skryf 'n kind-klas wat die metode oorheers.",
          "Wys hoe dieselfde verwysing verskillende uitvoer produseer."
        ],
        solution: "Polimorfisme: dieselfde metodenaam gedra hom verskillend na gelang van die objek. class Dier { void geluid(){ System.out.println('...'); } } class Hond extends Dier { @Override void geluid(){ System.out.println('Woef'); } } Dier d = new Hond(); d.geluid(); // 'Woef'",
        commonErrors: [
          "Oorheersing (dieselfde handtekening) met oorlading (dieselfde naam, verskillende parameters) verwar.",
          "@Override vergeet.",
          "new Dier() direk skep en Hond-gedrag verwag."
        ]
      }
    ]
  },

  "IT-6": {
    workedExamplesEn: [
      {
        question: "Decompose the problem: 'Build a school library system' into sub-problems using structured decomposition.",
        steps: [
          "Identify the top-level problem.",
          "Break it into 3–5 major sub-problems.",
          "For each sub-problem, list 2–3 specific tasks.",
          "Identify any shared tasks (pattern recognition)."
        ],
        solution: "Top level: Library Management System. Sub-problems: 1. Book catalogue — store book details, search by title/author, flag availability. 2. Member management — register members, assign IDs, track borrowing history. 3. Borrowing/return — check out books, set due dates, record returns, calculate fines. 4. Reporting — overdue books list, popular books report. Shared task: searching appears in catalogue AND borrowing — reuse the search function (pattern recognition).",
        commonErrors: [
          "Listing tasks without grouping them into logical sub-problems.",
          "No pattern recognition — failing to identify reusable components.",
          "Only listing 1–2 sub-problems — the question expects a full decomposition."
        ]
      },
      {
        question: "Write pseudocode for an algorithm that finds the largest number in a list of 10 numbers.",
        steps: [
          "Initialise a variable 'max' to the first element.",
          "Loop through all remaining elements.",
          "If current element > max, update max.",
          "After the loop, output max."
        ],
        solution: "SET max = numbers[0]\nFOR i = 1 TO 9\n  IF numbers[i] > max THEN\n    SET max = numbers[i]\n  ENDIF\nENDFOR\nOUTPUT max",
        commonErrors: [
          "Initialising max to 0 — fails if all numbers are negative.",
          "Starting the loop at 0 instead of 1 — causes an unnecessary comparison.",
          "Using '≥' instead of '>' — finding the last occurrence of max rather than the first."
        ]
      },
      {
        question: "What does O(n²) complexity mean? Give an example of an algorithm with this complexity and explain why it is slow for large inputs.",
        steps: [
          "Define O(n²) Big-O notation.",
          "Give an example algorithm.",
          "Explain growth rate.",
          "Compare to O(n) for context."
        ],
        solution: "O(n²): the time taken grows proportional to the square of the input size. Example: bubble sort — it uses two nested loops, each running n times, giving n × n = n² comparisons. Growth: if n=100 → 10 000 operations; n=1000 → 1 000 000 operations. By comparison, O(n) for n=1000 is just 1 000 operations — a thousand-fold difference at this scale.",
        commonErrors: [
          "Confusing O(n²) with O(2n) — squaring is fundamentally different from doubling.",
          "Saying bubble sort is always bad — for very small n, it is acceptable.",
          "No comparison to O(n) — context is essential for full marks."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Ontleed die probleem 'Bou 'n skoolbiblioteekstelsel' in sub-probleme deur gestruktureerde dekomposisie.",
        steps: [
          "Identifiseer die boonste vlak probleem.",
          "Verdeel dit in 3–5 hoof sub-probleme.",
          "Lys vir elke sub-probleem 2–3 spesifieke take.",
          "Identifiseer gedeelde take (patroonherkenning)."
        ],
        solution: "Boonste vlak: Biblioteekbestuurstelsel. Sub-probleme: 1. Boekkatalogus — stoor boekbesonderhede, soek. 2. Ledebeheer — registreer lede, geskiedenis volg. 3. Uitleen/teruggawe — uitboek, sperdatums, boetes. 4. Verslaggewing — agterstallige boeke, gewilde boeke. Gedeelde taak: soek verskyn in katalogus EN uitleen — hergebruik die soekfunksie.",
        commonErrors: [
          "Take sonder groepering in sub-probleme lys.",
          "Geen patroonherkenning.",
          "Slegs 1–2 sub-probleme."
        ]
      },
      {
        question: "Skryf pseudokode vir 'n algoritme wat die grootste getal in 'n lys van 10 getalle vind.",
        steps: [
          "Initialiseer 'maks' na die eerste element.",
          "Lus deur alle oorblywende elemente.",
          "As huidige element > maks, dateer maks op.",
          "Na die lus, voer maks uit."
        ],
        solution: "STEL maks = getalle[0]\nVIR i = 1 TOT 9\n  AS getalle[i] > maks DAN\n    STEL maks = getalle[i]\n  EINDEIF\nEINDEVIR\nUTVOER maks",
        commonErrors: [
          "maks na 0 initialiseer — misluk as alle getalle negatief is.",
          "Die lus by 0 begin.",
          "'≥' in plaas van '>' gebruik."
        ]
      },
      {
        question: "Wat beteken O(n²)-kompleksiteit? Gee 'n voorbeeld en verduidelik waarom dit stadig is vir groot invoere.",
        steps: [
          "Definieer O(n²) Big-O-notasie.",
          "Gee 'n voorbeeldalgoritme.",
          "Verduidelik groeikoers.",
          "Vergelyk met O(n) vir konteks."
        ],
        solution: "O(n²): die tyd groei eweredig aan die kwadraat van die invoergrootte. Voorbeeld: borrelsortering — twee geneste lusse, elk loop n keer, gee n × n = n² vergelykings. Groei: n=100 → 10 000 bewerkings; n=1000 → 1 000 000 bewerkings. O(n) by n=1000 is slegs 1 000 bewerkings — 'n duisendvoudige verskil.",
        commonErrors: [
          "O(n²) met O(2n) verwar.",
          "Sê borrelsortering is altyd sleg.",
          "Geen vergelyking met O(n)."
        ]
      }
    ]
  },

  // ===================== COMPUTER APPLICATIONS TECHNOLOGY (CAT) =====================

  "CAT-1": {
    workedExamplesEn: [
      {
        question: "Apply the IPO model to design a marks-processing system for a school.",
        steps: [
          "Identify all inputs.",
          "Describe the processing steps.",
          "Identify all outputs.",
          "Note any storage requirements."
        ],
        solution: "Input: learner names, subject codes, raw marks out of totals. Process: calculate percentage (mark/total×100), assign grade (A=80–100%, B=70–79%, …), flag learners below 30% for intervention. Output: printed report with name, percentage, grade per learner; list of at-risk learners. Storage: database or spreadsheet file of all learner records.",
        commonErrors: [
          "Listing output as an input (e.g. 'grade' is output, not input).",
          "Omitting the storage component.",
          "Describing only one output when the scenario clearly requires several."
        ]
      },
      {
        question: "Name and describe three phases of the Systems Development Life Cycle (SDLC) relevant to a CAT project.",
        steps: [
          "Name phase 1 → describe its activity.",
          "Name phase 2 → describe its activity.",
          "Name phase 3 → describe its activity."
        ],
        solution: "1. Analysis: identify user needs and problems — conduct interviews, document requirements. 2. Design: plan the solution — create input/output layouts, data flow diagrams, database structure. 3. Testing: verify the solution works — test with valid, invalid and boundary data; fix errors before deployment.",
        commonErrors: [
          "Confusing 'analysis' (what is needed) with 'design' (how to build it).",
          "Only naming phases without describing them.",
          "Omitting testing as a separate phase."
        ]
      },
      {
        question: "Explain the difference between validation and verification of data with one example of each.",
        steps: [
          "Define validation and give an example.",
          "Define verification and give an example."
        ],
        solution: "Validation: checking that data is reasonable, complete and within expected limits. Example: if a mark field only accepts values 0–100, entering 150 is rejected as invalid. Verification: checking that data entered matches the original source. Example: typing a password twice to confirm it was entered correctly.",
        commonErrors: [
          "Treating validation and verification as synonyms — they address different problems.",
          "No example given.",
          "Saying validation prevents all errors — it only checks format/range, not correctness of content."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Pas die IVU-model toe om 'n puntverwerkingstelsel vir 'n skool te ontwerp.",
        steps: [
          "Identifiseer alle invoere.",
          "Beskryf die verwerkingstappe.",
          "Identifiseer alle uitvoere.",
          "Let op stoorvereistes."
        ],
        solution: "Invoer: leerdernames, vakkosse, rou punte. Verwerking: bereken persentasie (punt/totaal×100), wys graad toe, merk leerders onder 30% vir intervensie. Uitvoer: gedrukte verslag met naam, persentasie, graad; lys van risiko-leerders. Stoor: databasis of sigblaaiers van alle leerderrekords.",
        commonErrors: [
          "Uitvoer as invoer lys (bv. 'graad' is uitvoer, nie invoer).",
          "Die stoorkomponent weglaat.",
          "Slegs een uitvoer beskryf."
        ]
      },
      {
        question: "Noem en beskryf drie fases van die Stelsels-ontwikkelingslewensiklus (SDLC) relevant tot 'n CAT-projek.",
        steps: [
          "Noem fase 1 → beskryf sy aktiwiteit.",
          "Noem fase 2 → beskryf sy aktiwiteit.",
          "Noem fase 3 → beskryf sy aktiwiteit."
        ],
        solution: "1. Analise: identifiseer gebruikersbehoeftes — onderhoude voer, vereistes dokumenteer. 2. Ontwerp: beplan die oplossing — invoer/uitvoer-uitlegte, databasisstruktuur. 3. Toetsing: verifieer dat die oplossing werk — toets met geldige, ongeldige en grensdata.",
        commonErrors: [
          "'Analise' met 'ontwerp' verwar.",
          "Slegs fases noem sonder beskrywing.",
          "Toetsing as 'n aparte fase weglaat."
        ]
      },
      {
        question: "Verduidelik die verskil tussen validering en verifikasie van data met een voorbeeld van elk.",
        steps: [
          "Definieer validering met 'n voorbeeld.",
          "Definieer verifikasie met 'n voorbeeld."
        ],
        solution: "Validering: kontroleer dat data redelik, volledig en binne verwagte grense is. Voorbeeld: as 'n puntveld slegs 0–100 aanvaar, word 150 as ongeldig verwerp. Verifikasie: kontroleer dat data ooreenstem met die oorspronklike bron. Voorbeeld: 'n wagwoord twee keer tik om te bevestig dit is korrek ingevoer.",
        commonErrors: [
          "Validering en verifikasie as sinonieme behandel.",
          "Geen voorbeeld gee nie.",
          "Sê validering voorkom alle foute."
        ]
      }
    ]
  },

  "CAT-2": {
    workedExamplesEn: [
      {
        question: "Describe the four main network topologies (star, bus, ring, mesh) and state one advantage of each.",
        steps: [
          "Name and describe each topology.",
          "State one advantage of each."
        ],
        solution: "Star: all devices connect to a central switch/hub. Advantage: failure of one device doesn't affect others. Bus: all devices share a single cable. Advantage: cheap and easy to install for small networks. Ring: devices connected in a closed loop. Advantage: equal access for all nodes. Mesh: each device connects to every other device. Advantage: high redundancy — multiple paths available if one link fails.",
        commonErrors: [
          "Confusing star (central switch) with mesh (every-to-every).",
          "No advantage given for any topology.",
          "Stating bus topology as the most reliable — it is actually the least reliable (single cable failure brings down the whole network)."
        ]
      },
      {
        question: "Explain the difference between a hub, a switch and a router.",
        steps: [
          "Define hub and how it handles data.",
          "Define switch and how it handles data.",
          "Define router and how it handles data."
        ],
        solution: "Hub: broadcasts incoming data to all connected devices — creates unnecessary traffic. Switch: sends data only to the specific device it is addressed to (uses MAC addresses) — more efficient. Router: connects different networks (e.g. LAN to internet), using IP addresses to route packets between networks.",
        commonErrors: [
          "Saying a switch is a smarter hub — they both operate at different OSI layers (hub = Layer 1, switch = Layer 2).",
          "Confusing router (connects networks) with switch (connects devices within a network).",
          "Describing a hub as sending data only to the destination — that is a switch."
        ]
      },
      {
        question: "What is the difference between wired (Ethernet) and wireless (Wi-Fi) networks in terms of speed, security and reliability?",
        steps: [
          "Compare speeds.",
          "Compare security.",
          "Compare reliability.",
          "Give a use-case recommendation."
        ],
        solution: "Speed: Ethernet (wired) is faster — up to 10 Gbps; Wi-Fi is limited by signal interference, typically 100 Mbps–1 Gbps. Security: Ethernet is more secure — data travels in cables, not over the air; Wi-Fi can be intercepted if not encrypted. Reliability: Ethernet is more reliable — not affected by physical obstacles or interference. Use case: Ethernet for servers and desktops; Wi-Fi for mobile devices.",
        commonErrors: [
          "Claiming Wi-Fi is always faster — modern Ethernet is consistently faster under load.",
          "No comparison on all three dimensions.",
          "No use-case recommendation."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Beskryf die vier hoof netwerktopologieë (ster, bus, ring, maas) en stel een voordeel van elk.",
        steps: [
          "Noem en beskryf elke topologie.",
          "Stel een voordeel van elk."
        ],
        solution: "Ster: alle toestelle koppel aan 'n sentrale skakelaar. Voordeel: mislukking van een toestel beïnvloed nie ander nie. Bus: alle toestelle deel 'n enkele kabel. Voordeel: goedkoop en maklik. Ring: toestelle in 'n geslote lus. Voordeel: gelyke toegang. Maas: elke toestel koppel aan elke ander. Voordeel: hoë oortolligheid.",
        commonErrors: [
          "Ster (sentrale skakelaar) met maas (elke-na-elke) verwar.",
          "Geen voordeel gee nie.",
          "Bus as die betroubaarste stel."
        ]
      },
      {
        question: "Verduidelik die verskil tussen 'n hub, 'n skakelaar en 'n router.",
        steps: [
          "Definieer hub en hoe dit data hanteer.",
          "Definieer skakelaar en hoe dit data hanteer.",
          "Definieer router en hoe dit data hanteer."
        ],
        solution: "Hub: stuur inkomende data na alle verbinde toestelle — skep onnodige verkeer. Skakelaar: stuur data slegs na die spesifieke toestel waarna dit geadresseer is (gebruik MAC-adresse). Router: koppel verskillende netwerke (bv. LAN aan internet), gebruik IP-adresse.",
        commonErrors: [
          "'n Skakelaar as 'n slimmer hub beskryf.",
          "Router (koppel netwerke) met skakelaar (koppel toestelle) verwar.",
          "'n Hub as data slegs na die bestemming stuur beskryf."
        ]
      },
      {
        question: "Wat is die verskil tussen 'n bedrade (Ethernet) en draadlose (Wi-Fi) netwerk ten opsigte van spoed, sekuriteit en betroubaarheid?",
        steps: [
          "Vergelyk spoede.",
          "Vergelyk sekuriteit.",
          "Vergelyk betroubaarheid.",
          "Gee 'n gebruiksgeval-aanbeveling."
        ],
        solution: "Spoed: Ethernet is vinniger — tot 10 Gbps; Wi-Fi tipies 100 Mbps–1 Gbps. Sekuriteit: Ethernet is veiliger — data in kabels, nie in lug nie. Betroubaarheid: Ethernet is meer betroubaar — nie beïnvloed deur hindernisse. Gebruiksgeval: Ethernet vir bedieners; Wi-Fi vir mobiele toestelle.",
        commonErrors: [
          "Beweer Wi-Fi is altyd vinniger.",
          "Geen vergelyking op alle drie dimensies.",
          "Geen gebruiksgeval-aanbeveling."
        ]
      }
    ]
  },

  "CAT-3": {
    workedExamplesEn: [
      {
        question: "Identify and explain three components of a URL using the example: https://www.education.gov.za/exams/grade12",
        steps: [
          "Identify the protocol.",
          "Identify the domain name.",
          "Identify the path.",
          "Explain each component's role."
        ],
        solution: "Protocol: https — specifies the communication method; 's' means the connection is encrypted with SSL/TLS. Domain name: www.education.gov.za — identifies the server hosting the website; '.gov.za' indicates a South African government site. Path: /exams/grade12 — specifies the location of the specific page/resource on the server.",
        commonErrors: [
          "Confusing the URL with the IP address — the URL is a human-readable address.",
          "Saying 'https' stands for 'hyper text transfer protocol secure site' — 'secure' refers to the SSL layer, not a separate protocol.",
          "Missing the path component."
        ]
      },
      {
        question: "Distinguish between a virus, worm and Trojan horse, and give one countermeasure for each.",
        steps: [
          "Define virus → countermeasure.",
          "Define worm → countermeasure.",
          "Define Trojan horse → countermeasure."
        ],
        solution: "Virus: malicious code that attaches to a legitimate file and spreads when the file is executed → Install and update antivirus software. Worm: self-replicating program that spreads across networks without user action → Use a firewall and network monitoring. Trojan horse: disguised as legitimate software but performs malicious actions when run → Only download software from trusted, verified sources.",
        commonErrors: [
          "Saying a worm needs a host file — worms are self-contained and spread independently.",
          "Confusing Trojan with ransomware — Trojans disguise themselves; ransomware encrypts files.",
          "No countermeasure given."
        ]
      },
      {
        question: "Explain what a 'digital footprint' is and describe two ways it can affect a person's life.",
        steps: [
          "Define digital footprint.",
          "Explain one positive effect.",
          "Explain one negative effect.",
          "Give advice on managing it."
        ],
        solution: "Digital footprint: the trail of data left behind by a person's online activity (posts, searches, purchases, location data). Positive effect: a strong professional online presence (LinkedIn profile, portfolio) can attract job offers. Negative effect: embarrassing posts or online arguments can damage a reputation with future employers or universities. Management: regularly review privacy settings, think before posting, use strong passwords.",
        commonErrors: [
          "Defining digital footprint as only social media activity — it includes all online activity.",
          "Only negative effects — the question asks for both.",
          "No advice on management."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Identifiseer en verduidelik drie komponente van 'n URL deur die voorbeeld: https://www.education.gov.za/exams/grade12",
        steps: [
          "Identifiseer die protokol.",
          "Identifiseer die domeinnaam.",
          "Identifiseer die pad.",
          "Verduidelik elke komponent se rol."
        ],
        solution: "Protokol: https — spesifiseer kommunikasiemetode; 's' beteken die verbinding is geënkripteer. Domeinnaam: www.education.gov.za — identifiseer die bediener; '.gov.za' dui 'n Suid-Afrikaanse regeringwebwerf aan. Pad: /exams/grade12 — spesifiseer die ligging van die spesifieke bladsy op die bediener.",
        commonErrors: [
          "Die URL met die IP-adres verwar.",
          "Sê 'https' staan vir 'hyper text transfer protocol secure site'.",
          "Die padkomponent weglaat."
        ]
      },
      {
        question: "Onderskei tussen 'n virus, wurm en Trojaanse perd, en gee een teenmaatreël vir elk.",
        steps: [
          "Definieer virus → teenmaatreël.",
          "Definieer wurm → teenmaatreël.",
          "Definieer Trojaanse perd → teenmaatreël."
        ],
        solution: "Virus: kwaadwillige kode wat aan 'n wettige lêer geheg word en versprei wanneer die lêer uitgevoer word → Installeer en dateer antivirusprogrammatuur op. Wurm: selfvermeerderende program wat oor netwerke versprei sonder gebruikersaksie → Gebruik 'n vuurmuur. Trojaanse perd: vermom as wettige sagteware maar voer kwaadwillige aksies uit → Laai slegs sagteware van vertroude bronne af.",
        commonErrors: [
          "Sê 'n wurm benodig 'n gasheerlêer.",
          "Trojaan met losprysware verwar.",
          "Geen teenmaatreël gee nie."
        ]
      },
      {
        question: "Verduidelik wat 'n 'digitale voetspoor' is en beskryf twee maniere waarop dit 'n persoon se lewe kan beïnvloed.",
        steps: [
          "Definieer digitale voetspoor.",
          "Verduidelik een positiewe effek.",
          "Verduidelik een negatiewe effek.",
          "Gee raad oor bestuur."
        ],
        solution: "Digitale voetspoor: die spoor van data wat 'n persoon se aanlyn aktiwiteit agterlaat. Positiewe effek: sterk professionele aanlyn teenwoordigheid kan werksgeleenthede lok. Negatiewe effek: verleenlike plasings kan reputasie by werkgewers beskadig. Bestuur: hersien privaatheidsstellings gereeld, dink voor jy plaas.",
        commonErrors: [
          "Digitale voetspoor as slegs sosiale media aktiwiteit definieer.",
          "Slegs negatiewe effekte gee.",
          "Geen bestuursraad nie."
        ]
      }
    ]
  },

  "CAT-4": {
    workedExamplesEn: [
      {
        question: "Explain the difference between primary and secondary data sources with two examples of each in a research context.",
        steps: [
          "Define primary data source.",
          "Give two examples.",
          "Define secondary data source.",
          "Give two examples."
        ],
        solution: "Primary data: collected directly by the researcher for a specific purpose. Examples: questionnaire administered to Grade 12 learners; observation of classroom behaviour. Secondary data: already collected and published by someone else. Examples: Statistics South Africa census reports; published academic journals.",
        commonErrors: [
          "Classifying a textbook as primary — textbooks summarise existing research (secondary).",
          "No examples given.",
          "Confusing primary (first-hand) with qualitative/quantitative — these are different categorisations."
        ]
      },
      {
        question: "What is copyright and how does it apply to digital information? Give two examples of copyright infringement.",
        steps: [
          "Define copyright.",
          "Explain how it applies to digital information.",
          "Give two examples of infringement."
        ],
        solution: "Copyright: the legal right that protects a creator's original work from being used without permission. Digital application: applies to text, images, music, software, and videos found online — 'available on the internet' does not mean 'free to use'. Infringement examples: 1. Downloading and sharing a movie without purchasing it. 2. Copying text from a website into an assignment without attribution.",
        commonErrors: [
          "Assuming internet content is public domain — most online content is still protected.",
          "No examples given.",
          "Confusing copyright with trademark."
        ]
      },
      {
        question: "List and explain three data types used in a database and give an example of a field that would use each type.",
        steps: [
          "Name data type 1 → explain → field example.",
          "Name data type 2 → explain → field example.",
          "Name data type 3 → explain → field example."
        ],
        solution: "1. Text/String: stores alphanumeric characters. Field: Learner Surname. 2. Number/Integer: stores whole numbers for calculations. Field: Mark (0–100). 3. Date/Time: stores calendar dates and times. Field: Date of Birth. Bonus: Boolean — stores only True/False. Field: Paid subscription (Yes/No).",
        commonErrors: [
          "Using Number for telephone numbers — phone numbers often have leading zeros and must be stored as Text.",
          "Confusing data type with data format.",
          "No field example given."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die verskil tussen primêre en sekondêre databronne met twee voorbeelde van elk.",
        steps: [
          "Definieer primêre databron.",
          "Gee twee voorbeelde.",
          "Definieer sekondêre databron.",
          "Gee twee voorbeelde."
        ],
        solution: "Primêre data: direk deur die navorser ingesamel. Voorbeelde: vraelys aan Gr. 12-leerders; waarneming van klaskamergedrag. Sekondêre data: reeds versamel en gepubliseer. Voorbeelde: StatsSA-sensusverslae; gepubliseerde akademiese tydskrifte.",
        commonErrors: [
          "Handboek as primêr klassifiseer.",
          "Geen voorbeelde gee nie.",
          "Primêr met kwalitatief/kwantitatief verwar."
        ]
      },
      {
        question: "Wat is kopiereg en hoe pas dit op digitale inligting toe? Gee twee voorbeelde van kopieregskending.",
        steps: [
          "Definieer kopiereg.",
          "Verduidelik hoe dit op digitale inligting van toepassing is.",
          "Gee twee voorbeelde van skending."
        ],
        solution: "Kopiereg: die wetlike reg wat 'n skepper se oorspronklike werk beskerm. Digitale toepassing: geld vir teks, beelde, musiek, sagteware en video's aanlyn. Skendingvoorbeelde: 1. 'n Film aflaai en deel sonder aankoop. 2. Teks van 'n webwerf kopieer sonder toeskrywing.",
        commonErrors: [
          "Aanvaar internetinhoud is publieke domein.",
          "Geen voorbeelde gee nie.",
          "Kopiereg met handelsmerk verwar."
        ]
      },
      {
        question: "Lys en verduidelik drie data-tipes in 'n databasis en gee 'n voorbeeld van 'n veld vir elk.",
        steps: [
          "Noem data-tipe 1 → verduidelik → veldvoorbeeld.",
          "Noem data-tipe 2 → verduidelik → veldvoorbeeld.",
          "Noem data-tipe 3 → verduidelik → veldvoorbeeld."
        ],
        solution: "1. Teks/Stryke: stoor alfanumeriese karakters. Veld: Leerder Van. 2. Nommer/Heelgetal: stoor heelgetalle vir berekeninge. Veld: Punt (0–100). 3. Datum/Tyd: stoor kalenderdata. Veld: Geboortedatum.",
        commonErrors: [
          "Nommer vir telefoonnommers gebruik.",
          "Data-tipe met dataformaat verwar.",
          "Geen veldvoorbeeld gee nie."
        ]
      }
    ]
  },

  "CAT-5": {
    workedExamplesEn: [
      {
        question: "Write an Excel formula to calculate the average of cells B2:B10 only for values above 50.",
        steps: [
          "Identify the function needed: AVERAGEIF.",
          "Identify the range to evaluate.",
          "Identify the criteria.",
          "Write and explain the complete formula."
        ],
        solution: "=AVERAGEIF(B2:B10,\">50\") — This averages all values in B2:B10 that are greater than 50. The criteria \">50\" is enclosed in quotes because it is a text comparison string. If no values match, the formula returns #DIV/0! (no values to average).",
        commonErrors: [
          "Writing =AVERAGE(B2:B10>50) — this is invalid syntax.",
          "Omitting quotes around the criteria string: >50 should be \">50\".",
          "Using AVERAGEIF when AVERAGEIFS is needed (multiple criteria)."
        ]
      },
      {
        question: "Explain the difference between absolute and relative cell references with an example of when to use each.",
        steps: [
          "Define relative cell reference.",
          "Explain how it behaves when copied.",
          "Define absolute cell reference.",
          "Explain how it behaves when copied.",
          "Give a practical example of each."
        ],
        solution: "Relative (A1): adjusts automatically when copied. Example: =A1*B1 copied one row down becomes =A2*B2 — useful for applying the same calculation to each row. Absolute ($A$1): remains fixed when copied. Example: =A1*$B$1 copied down keeps $B$1 fixed — useful when multiplying each value by a single tax rate stored in B1.",
        commonErrors: [
          "Using absolute reference when relative is needed — all copies point to the same cell.",
          "Only one $ (e.g. $A1) — this fixes the column but not the row (mixed reference).",
          "No practical example given."
        ]
      },
      {
        question: "Use VLOOKUP to retrieve a learner's grade from a grade table. The mark is in B2; the grade table is in D2:E6.",
        steps: [
          "Identify the lookup value (mark).",
          "Identify the table array (grade table).",
          "Identify the column index (which column contains the grade).",
          "Decide on exact match (0) or approximate match (1).",
          "Write the formula."
        ],
        solution: "=VLOOKUP(B2,$D$2:$E$6,2,1) — B2 is the mark (lookup value). $D$2:$E$6 is the absolute grade table. 2 returns the second column (grade symbols). 1 (TRUE) for approximate match — VLOOKUP finds the largest value ≤ the lookup value, which works for grade brackets (0–29=F, 30–49=E, 50–59=D…). Note: the first column of the table (D) must be sorted ascending.",
        commonErrors: [
          "Using 0 (exact match) for a grade table — grades are ranges, not exact values.",
          "Not sorting the first column ascending — approximate VLOOKUP requires sorted data.",
          "Using a relative reference for the table array — it shifts when copied, causing wrong lookups."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Skryf 'n Excel-formule om die gemiddelde van selle B2:B10 te bereken slegs vir waardes bo 50.",
        steps: [
          "Identifiseer die benodigde funksie: GEMIDDELDASAS.",
          "Identifiseer die reeks.",
          "Identifiseer die kriteria.",
          "Skryf en verduidelik die volledige formule."
        ],
        solution: "=AVERAGEIF(B2:B10,\">50\") — Dit gemiddeld alle waardes in B2:B10 wat groter as 50 is. Die kriteria \">50\" is in aanhalingstekens omsluit. As geen waardes ooreenstem nie, gee die formule #DIV/0! terug.",
        commonErrors: [
          "=GEMIDDELD(B2:B10>50) skryf.",
          "Aanhalingstekens om die kriteriastring weglaat.",
          "GEMIDDELDASAS gebruik wanneer GEMIDDELDASASSE benodig word."
        ]
      },
      {
        question: "Verduidelik die verskil tussen absolute en relatiewe selverwysings met 'n voorbeeld van wanneer elkeen gebruik word.",
        steps: [
          "Definieer relatiewe selverwysing.",
          "Verduidelik hoe dit gedra wanneer gekopieer.",
          "Definieer absolute selverwysing.",
          "Verduidelik hoe dit gedra wanneer gekopieer.",
          "Gee 'n praktiese voorbeeld van elk."
        ],
        solution: "Relatief (A1): pas outomaties aan wanneer gekopieer. Voorbeeld: =A1*B1 een ry af gekopieer word =A2*B2. Absoluut ($A$1): bly vas wanneer gekopieer. Voorbeeld: =A1*$B$1 afgekopieer hou $B$1 vas — nuttig wanneer elke waarde met 'n enkele belaskoers vermenigvuldig word.",
        commonErrors: [
          "Absolute verwysing gebruik wanneer relatief benodig word.",
          "Slegs een $ (bv. $A1) — dit maak 'n gemengde verwysing.",
          "Geen praktiese voorbeeld gee nie."
        ]
      },
      {
        question: "Gebruik VLOOKUP om 'n leerder se graad uit 'n graadtabel te haal. Die punt is in B2; die graadtabel is in D2:E6.",
        steps: [
          "Identifiseer die soekwaarde (punt).",
          "Identifiseer die tabelreeks.",
          "Identifiseer die kolomindeks.",
          "Besluit op presiese (0) of benaderde passing (1).",
          "Skryf die formule."
        ],
        solution: "=VLOOKUP(B2,$D$2:$E$6,2,1) — B2 is die punt. $D$2:$E$6 is die absolute graadtabel. 2 gee die tweede kolom terug. 1 (WAAR) vir benaderde passing — VLOOKUP vind die grootste waarde ≤ die soekwaarde. Die eerste kolom (D) moet oplopend gesorteer wees.",
        commonErrors: [
          "0 (presiese passing) vir 'n graadtabel gebruik.",
          "Die eerste kolom nie oplopend sorteer nie.",
          "Relatiewe verwysing vir die tabelreeks gebruik."
        ]
      }
    ]
  },

  "CAT-6": {
    workedExamplesEn: [
      {
        question: "Design a simple database table for a school library with appropriate fields, data types and a primary key.",
        steps: [
          "Identify the entity (what is being stored).",
          "List required fields.",
          "Assign a suitable data type to each field.",
          "Choose a primary key."
        ],
        solution: "Entity: Book. Fields: BookID (Number — primary key, auto-number), Title (Text, 255 chars), Author (Text, 100 chars), ISBN (Text, 13 chars — stored as Text to preserve leading zeros), Genre (Text, 50 chars), Available (Yes/No — Boolean). Primary key: BookID — unique, auto-generated, never NULL.",
        commonErrors: [
          "Choosing Title as the primary key — titles are not unique (two books can have the same title).",
          "Storing ISBN as a Number — leading zeros in numeric fields are dropped.",
          "No primary key identified."
        ]
      },
      {
        question: "Write an Access query criterion to find all books borrowed between 1 January 2026 and 30 June 2026.",
        steps: [
          "Identify the date field.",
          "Write the Between...And criterion.",
          "Use the correct Access date format (#MM/DD/YYYY#)."
        ],
        solution: "In the BorrowDate field criteria: Between #1/1/2026# And #6/30/2026# — Access uses the #date# notation. 'Between…And' is inclusive of both boundary dates.",
        commonErrors: [
          "Using >=01/01/2026 AND <=30/06/2026 without the # delimiters — Access requires #.",
          "Reversing month and day — Access expects MM/DD/YYYY format.",
          "Using 'OR' instead of 'And' — OR would give a very different result."
        ]
      },
      {
        question: "Explain the purpose of a one-to-many relationship in a database and give an example from a school context.",
        steps: [
          "Define one-to-many relationship.",
          "Explain how it is implemented (foreign key).",
          "Give a school example.",
          "State why this avoids data redundancy."
        ],
        solution: "One-to-many: one record in Table A relates to many records in Table B, but each record in Table B relates to only one record in Table A. Implementation: a foreign key in Table B references the primary key of Table A. School example: one Teacher teaches many Classes — TeacherID (PK in Teachers table) becomes a foreign key in the Classes table. Avoids redundancy: teacher details are stored once, not repeated for every class they teach.",
        commonErrors: [
          "Confusing one-to-many with many-to-many (requires a junction table).",
          "No school example given.",
          "Not explaining the foreign key mechanism."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Ontwerp 'n eenvoudige databasis tabel vir 'n skoolbiblioteek met gepaste velde, data-tipes en 'n primêre sleutel.",
        steps: [
          "Identifiseer die entiteit.",
          "Lys vereiste velde.",
          "Wys 'n geskikte data-tipe toe aan elke veld.",
          "Kies 'n primêre sleutel."
        ],
        solution: "Entiteit: Boek. Velde: BoekID (Nommer — primêre sleutel, outo-nommer), Titel (Teks), Outeur (Teks), ISBN (Teks — as Teks gestoor om voorste nulle te behou), Genre (Teks), Beskikbaar (Ja/Nee). Primêre sleutel: BoekID — uniek, outo-gegenereer.",
        commonErrors: [
          "Titel as primêre sleutel kies.",
          "ISBN as Nommer stoor.",
          "Geen primêre sleutel identifiseer nie."
        ]
      },
      {
        question: "Skryf 'n Access-navraaikkriteria om alle boeke te vind wat tussen 1 Januarie 2026 en 30 Junie 2026 geleen is.",
        steps: [
          "Identifiseer die datumveld.",
          "Skryf die Tussen...En kriteria.",
          "Gebruik die korrekte Access-datumformaat (#MM/DD/JJJJ#)."
        ],
        solution: "In die LeendatumVeld kriteria: Tussen #1/1/2026# En #6/30/2026#. 'Tussen…En' is insluitend van beide grensdatums.",
        commonErrors: [
          "# skeidingstekens weglaat.",
          "Maand en dag omruil.",
          "'OF' in plaas van 'En' gebruik."
        ]
      },
      {
        question: "Verduidelik die doel van 'n een-tot-baie verwantskap in 'n databasis en gee 'n voorbeeld in 'n skoolkonteks.",
        steps: [
          "Definieer een-tot-baie verwantskap.",
          "Verduidelik hoe dit geïmplementeer word (vreemde sleutel).",
          "Gee 'n skoolvoorbeeld.",
          "Stel waarom dit data-oortolligheid voorkom."
        ],
        solution: "Een-tot-baie: een rekord in Tabel A hou verband met baie rekords in Tabel B. Implementering: 'n vreemde sleutel in Tabel B verwys na die primêre sleutel van Tabel A. Skoolvoorbeeld: een Onderwyser gee les aan baie Klasse — OnderwyserId (PK in Onderwysers) word 'n vreemde sleutel in Klasse. Voorkom oortolligheid: onderwysersbesonderhede word een keer gestoor.",
        commonErrors: [
          "Een-tot-baie met baie-tot-baie verwar.",
          "Geen skoolvoorbeeld gee nie.",
          "Die vreemde sleutel meganisme nie verduidelik nie."
        ]
      }
    ]
  },

  "CAT-7": {
    workedExamplesEn: [
      {
        question: "Describe three steps to perform a mail merge in MS Word to produce personalised letters.",
        steps: [
          "Step 1: Set up the main document.",
          "Step 2: Connect to a data source.",
          "Step 3: Insert merge fields and complete the merge."
        ],
        solution: "Step 1: Create the letter template in Word — type the standard text but leave placeholders where personalised data will go. Step 2: Open Mailings → Start Mail Merge → connect to a data source (e.g. an Excel spreadsheet with Name, Address, etc.). Step 3: Insert merge fields (e.g. «Name», «Address») at the correct positions. Preview results to confirm correctness, then Finish & Merge → Print or Send Email.",
        commonErrors: [
          "Connecting to the data source before creating the main document — either order works but the data source must exist before connecting.",
          "Forgetting to preview results before printing — errors only visible after preview.",
          "Using a CSV without a header row — Word uses the first row as field names."
        ]
      },
      {
        question: "Explain the purpose of Styles in MS Word and describe how to apply and modify a heading style.",
        steps: [
          "Define Styles and their purpose.",
          "Explain how to apply a style.",
          "Explain how to modify a style.",
          "State one benefit of using Styles."
        ],
        solution: "Styles: predefined sets of formatting attributes (font, size, colour, spacing) applied to text with a single click. Apply: select text → Home tab → Styles gallery → click 'Heading 1'. Modify: right-click Heading 1 in the Styles gallery → Modify → change font, size, colour → OK. All text using Heading 1 updates automatically. Benefit: consistent formatting throughout a long document; changing one style updates all instances.",
        commonErrors: [
          "Manually formatting each heading instead of using Styles.",
          "Confusing character styles with paragraph styles.",
          "No benefit stated."
        ]
      },
      {
        question: "Explain how Track Changes works in MS Word and describe how to accept or reject a change.",
        steps: [
          "Explain what Track Changes does.",
          "Explain how to enable it.",
          "Describe what changes look like on screen.",
          "Explain how to accept or reject."
        ],
        solution: "Track Changes: records every insertion, deletion and formatting change made to a document, showing who made it and when. Enable: Review tab → Track Changes → Track Changes (toggle on). On screen: insertions appear underlined and coloured; deletions appear as coloured strikethrough text. Accept/Reject: Review tab → select a change → click Accept (incorporates it) or Reject (removes it); or Accept All / Reject All for bulk decisions.",
        commonErrors: [
          "Deleting changes without using Accept/Reject — the change markup remains.",
          "Confusing track changes with version history (two different features).",
          "Not describing what changes look like on screen."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Beskryf drie stappe om 'n possamevoeging in MS Word uit te voer om gepersonaliseerde briewe te produseer.",
        steps: [
          "Stap 1: Stel die hoofopument op.",
          "Stap 2: Koppel aan 'n databron.",
          "Stap 3: Voeg samevoegvelde in en voltooi die samevoeging."
        ],
        solution: "Stap 1: Skep die briefsjabloon in Word — tik die standaardteks maar laat plekhouers waar data in gaan. Stap 2: Posrouting → Begin Possamevoeging → koppel aan 'n databron (bv. Excel-sigblad). Stap 3: Voeg samevoegvelde in (bv. «Naam», «Adres»). Voorskou resultate, dan Voltooi en saamvoeg → Druk of E-pos.",
        commonErrors: [
          "Aan die databron koppel voor die hoofopument geskep is.",
          "Vergeet om resultate voor drukking te voorskou.",
          "'n CSV sonder 'n opskrifrij gebruik."
        ]
      },
      {
        question: "Verduidelik die doel van Style in MS Word en beskryf hoe om 'n opskrifstyl toe te pas en te wysig.",
        steps: [
          "Definieer Style en hul doel.",
          "Verduidelik hoe om 'n styl toe te pas.",
          "Verduidelik hoe om 'n styl te wysig.",
          "Stel een voordeel van Style."
        ],
        solution: "Style: vooraf gedefinieerde stelle opmaakatribute wat met een klik toegepas word. Toepassing: kies teks → Tuis-oortjie → Styl-galery → klik 'Opskrif 1'. Wysiging: regskliek Opskrif 1 → Wysig → verander lettertipe, grootte, kleur → OK. Alle teks wat Opskrif 1 gebruik, dateer outomaties op. Voordeel: konsekwente opmaak regdeur 'n lang dokument.",
        commonErrors: [
          "Elke opskrif handmatig formateer.",
          "Karakterstyle met paragrafstyle verwar.",
          "Geen voordeel stel nie."
        ]
      },
      {
        question: "Verduidelik hoe Wysigingsopsporing in MS Word werk en beskryf hoe om 'n wysiging te aanvaar of te verwerp.",
        steps: [
          "Verduidelik wat Wysigingsopsporing doen.",
          "Verduidelik hoe om dit te aktiveer.",
          "Beskryf hoe wysigings op die skerm lyk.",
          "Verduidelik hoe om te aanvaar of te verwerp."
        ],
        solution: "Wysigingsopsporing: rekord elke invoeging, skrapping en opmaakwysiging, wys wie dit gemaak het en wanneer. Aktiveer: Hersiening-oortjie → Wysigingsopsporing (wissel aan). Op skerm: invoegings verskyn onderstreep en gekleur; skrappings as gekleurde deurstreep teks. Aanvaar/Verwerp: Hersiening-oortjie → kies 'n wysiging → Aanvaar of Verwerp.",
        commonErrors: [
          "Wysigings uitvee sonder Aanvaar/Verwerp.",
          "Wysigingsopsporing met weergawegeskiedenis verwar.",
          "Nie beskryf hoe wysigings op skerm lyk nie."
        ]
      }
    ]
  },

  // ===================== ENGINEERING GRAPHICS AND DESIGN (EGD) =====================

  "EGD-1": {
    workedExamplesEn: [
      {
        question: "A building floor plan is drawn at scale 1:100. A room measures 35 mm × 22 mm on the drawing. Calculate the actual room dimensions.",
        steps: [
          "Apply the scale formula: actual size = drawing size × scale factor.",
          "Calculate actual length.",
          "Calculate actual width.",
          "Convert to metres."
        ],
        solution: "Scale factor = 100. Actual length = 35 mm × 100 = 3 500 mm = 3.5 m. Actual width = 22 mm × 100 = 2 200 mm = 2.2 m. The room is 3.5 m × 2.2 m.",
        commonErrors: [
          "Dividing by the scale factor instead of multiplying (confusing model → actual with actual → drawing).",
          "Forgetting to convert mm to metres.",
          "Applying the scale only to one dimension."
        ]
      },
      {
        question: "Describe the conventions used for drawing a door and a window on a floor plan.",
        steps: [
          "Describe how a door is drawn (swing arc).",
          "Describe how a window is drawn (three parallel lines in the wall).",
          "State the standard line types used."
        ],
        solution: "Door: drawn as a thin line (door panel) with a quarter-circle arc showing the swing direction; the arc indicates the space needed for the door to open. Window: shown as three parallel thin lines within the wall opening (outer frame, sill/glass, inner frame). Line types: all floor plan outlines are continuous thick lines; hidden features use dashed lines.",
        commonErrors: [
          "Drawing the door swing as a full circle — only a quarter arc.",
          "Omitting the three-line window convention.",
          "Using thick lines for interior features — only structural walls are thick."
        ]
      },
      {
        question: "Explain what a site plan shows and list five elements that must appear on it.",
        steps: [
          "Define a site plan.",
          "List five required elements."
        ],
        solution: "Site plan: a drawing showing a building or group of buildings in relation to the property boundaries, roads and surrounding features, viewed from above. Required elements: 1. North point. 2. Property boundaries with dimensions. 3. Building footprint and setbacks. 4. Access roads and driveway. 5. Scale indicator.",
        commonErrors: [
          "Confusing a site plan with a floor plan — the site plan shows the building on the plot, not interior rooms.",
          "Omitting the north point.",
          "Fewer than 5 elements listed."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Ingenieurstekening is op skaal 1:100 geteken. 'n Kamer meet 35 mm × 22 mm op die tekening. Bereken die werklike afmetings.",
        steps: [
          "Pas die skaalformule toe: werklike grootte = tekening grootte × skaalfaktor.",
          "Bereken werklike lengte.",
          "Bereken werklike breedte.",
          "Skakel na meter om."
        ],
        solution: "Skaalfaktor = 100. Werklike lengte = 35 mm × 100 = 3 500 mm = 3.5 m. Werklike breedte = 22 mm × 100 = 2 200 mm = 2.2 m. Die kamer is 3.5 m × 2.2 m.",
        commonErrors: [
          "Deel deur die skaalfaktor eerder as vermenigvuldig.",
          "Vergeet om mm na meter om te skakel.",
          "Die skaal slegs op een dimensie toepas."
        ]
      },
      {
        question: "Beskryf die konvensies vir die tekening van 'n deur en 'n venster op 'n vloerplan.",
        steps: [
          "Beskryf hoe 'n deur geteken word.",
          "Beskryf hoe 'n venster geteken word.",
          "Stel die standaard lynsoorte."
        ],
        solution: "Deur: geteken as 'n dun lyn (deurpaneel) met 'n kwart-sirkelboog wat die swaairigting toon. Venster: getoon as drie parallelle dun lyne binne die muuropening. Lynsoorte: alle vloerplanomlynings is deurlopend dik lyne; versteekte kenmerke gebruik strepellyne.",
        commonErrors: [
          "Die deurswaaiboog as 'n volle sirkel teken.",
          "Die drielynsvenster konvensie weglaat.",
          "Dik lyne vir binnekante kenmerke gebruik."
        ]
      },
      {
        question: "Verduidelik wat 'n terreinplan toon en lys vyf elemente wat daarop moet verskyn.",
        steps: [
          "Definieer 'n terreinplan.",
          "Lys vyf vereiste elemente."
        ],
        solution: "Terreinplan: 'n tekening wat 'n gebou in verhouding tot eiendomsgrense, paaie en omliggende kenmerke toon. Vereiste elemente: 1. Noordpunt. 2. Eiendomsgrense met afmetings. 3. Gebouvoetspoor en terugsettings. 4. Toegangspaaie. 5. Skaalindicator.",
        commonErrors: [
          "Terreinplan met vloerplan verwar.",
          "Noordpunt weglaat.",
          "Minder as 5 elemente lys."
        ]
      }
    ]
  },

  "EGD-2": {
    workedExamplesEn: [
      {
        question: "In third-angle orthographic projection, draw and label the positions of the front, top and right-side views.",
        steps: [
          "Define third-angle projection.",
          "State where the top view is placed.",
          "State where the right-side view is placed.",
          "Explain the projection principle."
        ],
        solution: "Third-angle projection (used in South Africa): the object is imagined inside a transparent box; each face of the box is 'unfolded'. Top view: placed directly above the front view. Right-side view: placed directly to the right of the front view. Principle: the view represents what you see from that side, placed on the same side as you are viewing from.",
        commonErrors: [
          "Placing views in first-angle positions (top below, right-side to the left).",
          "Confusing third-angle with first-angle — the symbol on the drawing indicates which system is used.",
          "No labelling of views."
        ]
      },
      {
        question: "Explain what a sectional view is and when it is used in mechanical drawing.",
        steps: [
          "Define a sectional view.",
          "Explain when it is used.",
          "Describe how the cut surface is indicated.",
          "Name two types of sections."
        ],
        solution: "Sectional view: an imaginary cutting plane slices through the object, removing the front portion to reveal internal features. Used when: the interior details are complex or hidden behind too many hidden lines, making the drawing unclear. Cut surface: shown with section hatching (thin diagonal lines at 45°). Types: full section (cut through entire object) and half section (cut through half, showing exterior and interior simultaneously).",
        commonErrors: [
          "Hatch lines drawn at random angles — always 45° and evenly spaced.",
          "Not removing the front portion of the object in a full section.",
          "No mention of when sections are used."
        ]
      },
      {
        question: "A cylinder of diameter 50 mm and length 80 mm is given. List all dimensions that must be shown on a technical drawing.",
        steps: [
          "Identify the shape-defining dimensions.",
          "Apply dimensioning conventions (leaders, dimension lines).",
          "State the Ø symbol for diameter.",
          "Check no dimension is repeated."
        ],
        solution: "Required dimensions: Ø50 (diameter — the Ø prefix indicates diameter, so only one view needs it) and 80 (length). In a front view: draw two parallel rectangles (outline of cylinder) with dimension line showing 80 mm along the length, and one dimension showing Ø50. Note: if both views are shown, dimension each feature ONCE only — no duplicate dimensions.",
        commonErrors: [
          "Writing '50' for the diameter without the Ø symbol.",
          "Dimensioning the diameter in both views — dimension once only.",
          "Dimension lines crossing — leaders and dimension lines must not intersect."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "In derde-hoek ortografiese projeksie, teken en etiketteer die posisies van die voor-, bo- en regteraansigte.",
        steps: [
          "Definieer derde-hoek projeksie.",
          "Stel waar die boansigte geplaas word.",
          "Stel waar die regtersy-aansig geplaas word.",
          "Verduidelik die projeksiebeginsels."
        ],
        solution: "Derde-hoek projeksie: die voorwerp word in 'n deursigtige kas geïmagineer; elke vlak word 'oopgevou'. Boansigte: direk bo die vooraansig. Regtersy: direk regs van die vooraansig. Beginsel: die aansig verteenwoordig wat jy van dié kant sien, geplaas aan dieselfde kant as waar jy kyk.",
        commonErrors: [
          "Aansigte in eerste-hoek posisies plaas.",
          "Eerste-hoek met derde-hoek verwar.",
          "Geen etikettering van aansigte."
        ]
      },
      {
        question: "Verduidelik wat 'n snitaansig is en wanneer dit in meganiese tekening gebruik word.",
        steps: [
          "Definieer 'n snitaansig.",
          "Verduidelik wanneer dit gebruik word.",
          "Beskryf hoe die snitvlak aangedui word.",
          "Noem twee tipes snitte."
        ],
        solution: "Snitaansig: 'n denkbeeldige snit deur die voorwerp om interne kenmerke te onthul. Gebruik wanneer: interne besonderhede te kompleks is. Snitvlak: getoon met snit-arserring (dun diagonale lyne teen 45°). Tipes: volledige snit en halfsnit.",
        commonErrors: [
          "Arseerlyne teen willekeurige hoeke teken.",
          "Nie die voorpunt van die voorwerp verwyder nie.",
          "Geen vermelding van wanneer snitte gebruik word nie."
        ]
      },
      {
        question: "Silinder van diameter 50 mm en lengte 80 mm word gegee. Lys alle afmetings wat op 'n tegniese tekening getoon moet word.",
        steps: [
          "Identifiseer die vormdefiniërende afmetings.",
          "Pas bematingskonvensies toe.",
          "Stel die Ø-simbool vir deursnee.",
          "Kontroleer dat geen afmeting herhaal word nie."
        ],
        solution: "Vereiste afmetings: Ø50 (deursnee — die Ø-voorvoegsel dui deursnee aan) en 80 (lengte). In die vooraansig: bemaat 80 mm langs die lengte en Ø50. Let op: as beide aansigte getoon word, bemaat elke kenmerk slegs EENKEER.",
        commonErrors: [
          "'50' skryf vir die deursnee sonder Ø-simbool.",
          "Die deursnee in beide aansigte bemaat.",
          "Bematinglese wat kruis."
        ]
      }
    ]
  },

  "EGD-3": {
    workedExamplesEn: [
      {
        question: "Draw the isometric view of a rectangular prism (L=60mm, W=40mm, H=30mm) using the box method.",
        steps: [
          "Draw the three isometric axes (one vertical, two at 30°).",
          "Mark true lengths along each axis: 60 along one 30° axis, 40 along the other, 30 along the vertical.",
          "Complete the isometric box by drawing parallel lines from each marked point.",
          "Darken visible edges."
        ],
        solution: "Axes: vertical for height (30mm); left 30° axis for width (40mm); right 30° axis for length (60mm). All measurements are true lengths only along the three axial directions. Complete the box by drawing parallel lines from the endpoints: 3 visible faces and 3 hidden edges. Visible edges: continuous; hidden edges: dashed or omitted.",
        commonErrors: [
          "Measuring lengths perpendicular to the axes — true lengths only along axes.",
          "Drawing horizontal lines instead of 30° lines for width/depth.",
          "Showing all hidden edges — only visible edges are typically shown in pictorial drawings."
        ]
      },
      {
        question: "Explain how to draw a circle on an isometric face (e.g. on the top face of a cube).",
        steps: [
          "Locate the centre of the isometric face.",
          "Draw the enclosing isometric rhombus (diamond shape).",
          "Use the four-centre ellipse method to draw the ellipse.",
          "Mark the four arc centres and draw the four arcs."
        ],
        solution: "1. Draw the isometric rhombus on the top face (a parallelogram with 30° sides). 2. Find midpoints of each side — these are tangent points of the ellipse. 3. Four-centre method: connect opposite corners to the adjacent midpoints — intersections give arc centres (2 from short diagonal corners, 2 from long diagonal). 4. Draw four arcs from these centres through the tangent points to form the ellipse.",
        commonErrors: [
          "Drawing a true circle instead of an ellipse — circles become ellipses on isometric faces.",
          "Not using the four-centre method — freehand ellipses are inaccurate.",
          "Forgetting that the ellipse orientation changes on different faces (top, front, side)."
        ]
      },
      {
        question: "State three rules of isometric drawing that must always be followed.",
        steps: [
          "State rule 1.",
          "State rule 2.",
          "State rule 3."
        ],
        solution: "Rule 1: True lengths are only measured along the three isometric axes (vertical and the two 30° lines). Rule 2: Lines not parallel to an axis (non-isometric lines, e.g. diagonals) must be plotted from their endpoints, not measured directly. Rule 3: Circles on isometric faces are drawn as ellipses using the four-centre method.",
        commonErrors: [
          "Measuring a non-isometric line directly — this gives a distorted length.",
          "Drawing 45° lines instead of 30° lines.",
          "Treating all ellipses as identical — orientation varies by face."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Teken die isometriese aansig van 'n reghoekige prisma (L=60mm, B=40mm, H=30mm) deur die kas-metode.",
        steps: [
          "Teken die drie isometriese asse.",
          "Merk ware lengtes langs elke as.",
          "Voltooi die isometriese kas.",
          "Maak sigbare rante donkerder."
        ],
        solution: "Asse: vertikaal vir hoogte (30mm); linker 30°-as vir breedte (40mm); regter 30°-as vir lengte (60mm). Alle metings is ware lengtes slegs langs die drie asrigtings. Voltooi die kas deur parallelle lyne van eindpunte te teken.",
        commonErrors: [
          "Lengtes loodreg op die asse meet.",
          "Horisontale lyne in plaas van 30° lyne teken.",
          "Alle versteekte rante toon."
        ]
      },
      {
        question: "Verduidelik hoe om 'n sirkel op 'n isometriese vlak te teken.",
        steps: [
          "Vind die middelpunt van die isometriese vlak.",
          "Teken die omsluitende isometriese rombus.",
          "Gebruik die vier-middelpunt ellipsmetode.",
          "Merk die vier boogmiddelpunte en teken die vier boë."
        ],
        solution: "1. Teken die isometriese rombus op die bovlak. 2. Vind midpunte van elke kant — dit is raakpunte. 3. Vier-middelpunt metode: verbind teenoorstaande hoeke met aangrensende midpunte — kruispunte gee boogmiddelpunte. 4. Teken vier boë van hierdie middelpunte deur raakpunte.",
        commonErrors: [
          "Ware sirkel in plaas van ellips teken.",
          "Die vier-middelpunt metode nie gebruik nie.",
          "Vergeet dat ellipsoriëntasie op verskillende vlakke verander."
        ]
      },
      {
        question: "Stel drie reëls van isometriese tekening wat altyd gevolg moet word.",
        steps: [
          "Stel reël 1.",
          "Stel reël 2.",
          "Stel reël 3."
        ],
        solution: "Reël 1: Ware lengtes word slegs langs die drie isometriese asse gemeet. Reël 2: Nie-isometriese lyne (bv. diagonale) word van hul eindpunte af beplan, nie direk gemeet nie. Reël 3: Sirkels op isometriese vlakke word as ellipse met die vier-middelpunt metode geteken.",
        commonErrors: [
          "'n Nie-isometriese lyn direk meet.",
          "45° lyne in plaas van 30° lyne teken.",
          "Alle ellipse as identies behandel."
        ]
      }
    ]
  },

  "EGD-4": {
    workedExamplesEn: [
      {
        question: "Explain the components of a two-point perspective drawing and locate the position of both vanishing points.",
        steps: [
          "Define the horizon line (HL).",
          "Define the vanishing points (VP1 and VP2).",
          "Define the picture plane and station point.",
          "Explain how all horizontal edges of the object converge."
        ],
        solution: "Horizon line: a horizontal line at the viewer's eye level — always in the drawing. VP1 and VP2: both vanishing points lie on the horizon line, one to the left and one to the right. Station point: the theoretical position of the viewer, placed outside the picture plane. Picture plane: the transparent plane through which the scene is viewed. All horizontal edges of the object recede to either VP1 or VP2; only true verticals remain vertical.",
        commonErrors: [
          "Placing vanishing points above or below the horizon line.",
          "Making vertical edges recede to a VP — verticals stay vertical in 2-point perspective.",
          "Confusing horizon line with the baseline of the object."
        ]
      },
      {
        question: "Describe the difference between one-point and two-point perspective drawing and give an appropriate situation for each.",
        steps: [
          "Describe one-point perspective.",
          "Give an appropriate situation.",
          "Describe two-point perspective.",
          "Give an appropriate situation."
        ],
        solution: "One-point perspective: one VP on the horizon line; front faces of objects are parallel to the picture plane (frontal view). Situation: drawing a room interior (looking straight into the room). Two-point perspective: two VPs; the object is turned so a corner faces the viewer. Situation: drawing an exterior corner of a building at an angle.",
        commonErrors: [
          "Saying one-point has no vanishing point — it has exactly one.",
          "Applying two-point rules to a room interior — rooms are typically drawn in one-point.",
          "No situation given for either type."
        ]
      },
      {
        question: "In a one-point perspective drawing of a corridor, the back wall is 50mm wide and 30mm high on the drawing. The VP is centred on the back wall. Draw and label the key lines.",
        steps: [
          "Draw the horizon line.",
          "Mark the VP on the horizon line.",
          "Draw the back wall rectangle.",
          "Draw receding lines from all four corners of the back wall to the VP."
        ],
        solution: "Horizon line: horizontal line, VP marked at its centre. Back wall: 50×30mm rectangle centred on VP. Receding lines: from top-left and bottom-left corners to VP (form left wall and ceiling); from top-right and bottom-right corners to VP (form right wall and floor). These four lines define the corridor in perspective.",
        commonErrors: [
          "Receding lines not converging at exactly one point.",
          "VP placed off the horizon line.",
          "Back wall not centred when the question specifies a centred VP."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die komponente van 'n tweepunt-perspektieftekening en lokaliseer die posisie van beide verdwynpunte.",
        steps: [
          "Definieer die horisontlyn.",
          "Definieer die verdwynpunte.",
          "Definieer die beeldvlak en stasionpunt.",
          "Verduidelik hoe alle horisontale rante konvergeer."
        ],
        solution: "Horisontlyn: 'n horisontale lyn op die kyker se ooghoogte. VP1 en VP2: beide verdwynpunte lê op die horisontlyn, links en regs. Stasionpunt: die teoretiese posisie van die kyker. Beeldvlak: die deursigtige vlak waardeur die toneel gesien word. Alle horisontale rante wyk na VP1 of VP2; slegs ware vertikale bly vertikaal.",
        commonErrors: [
          "Verdwynpunte bo of onder die horisontlyn plaas.",
          "Vertikale rante na 'n VP laat wyk.",
          "Horisontlyn met die basislyn van die voorwerp verwar."
        ]
      },
      {
        question: "Beskryf die verskil tussen eenpunt- en tweepunt-perspektieftekening en gee 'n geskikte situasie vir elk.",
        steps: [
          "Beskryf eenpunt-perspektief.",
          "Gee 'n geskikte situasie.",
          "Beskryf tweepunt-perspektief.",
          "Gee 'n geskikte situasie."
        ],
        solution: "Eenpunt: een VP; voorvlakke van voorwerpe is parallel aan die beeldvlak. Situasie: 'n kamerinterieur teken. Tweepunt: twee VP's; die voorwerp se hoek kyk na die kyker. Situasie: 'n buitekant hoek van 'n gebou by 'n hoek.",
        commonErrors: [
          "Sê eenpunt het geen verdwynpunt nie.",
          "Tweepunt-reëls op 'n kamerinterieur toepas.",
          "Geen situasie gee vir enige tipe nie."
        ]
      },
      {
        question: "In 'n eenpunt-perspektieftekening van 'n gang is die agtermuur 50mm breed en 30mm hoog. Die VP is in die middel van die agtermuur. Teken en etiketteer die sleutellyne.",
        steps: [
          "Teken die horisontlyn.",
          "Merk die VP op die horisontlyn.",
          "Teken die agtermuurregthoek.",
          "Teken terugwykende lyne van alle vier hoeke na die VP."
        ],
        solution: "Horisontlyn: horisontale lyn, VP in die middel. Agtermuur: 50×30mm reghoek gesentreer op VP. Terugwykende lyne: van links-bo en links-onder hoeke na VP (linker muur en plafon); van regs-bo en regs-onder na VP (regter muur en vloer).",
        commonErrors: [
          "Terugwykende lyne wat nie presies op een punt konvergeer nie.",
          "VP buite die horisontlyn geplaas.",
          "Agtermuur nie gesentreer wanneer die vraag dit spesifiseer nie."
        ]
      }
    ]
  },

  "EGD-5": {
    workedExamplesEn: [
      {
        question: "Develop (unfold) a right square prism with base 40mm × 40mm and height 60mm.",
        steps: [
          "Identify the number of rectangular faces.",
          "Calculate the perimeter of the base (total width of the development).",
          "Draw the four rectangular faces in a row.",
          "Add the top and bottom square faces to the development."
        ],
        solution: "A square prism has 4 rectangular sides and 2 square ends. Total width of development = perimeter = 4 × 40 = 160mm. Height = 60mm. Draw a 160mm × 60mm rectangle divided into 4 equal 40mm sections (the four sides). Attach a 40mm × 40mm square at one end for the base. Attach another 40mm × 40mm square at the top of one section for the lid.",
        commonErrors: [
          "Forgetting to add the two square ends — development must include all surfaces.",
          "Width of development = one side length (40mm) instead of perimeter (160mm).",
          "Overlapping the end squares — they must be placed so the net folds correctly."
        ]
      },
      {
        question: "What is the development of a right cylinder with radius 25mm and height 80mm? Give all calculations.",
        steps: [
          "Calculate the circumference (width of rectangular part).",
          "State the height of the rectangular part.",
          "Draw the rectangle.",
          "Draw the two circular ends."
        ],
        solution: "Circumference = 2πr = 2 × π × 25 = 157.1mm (width). Height = 80mm. Development: a rectangle 157.1mm wide × 80mm tall, plus two circles of radius 25mm (one attached to each long edge). Total surface area = 2πr² + 2πrh = 2π(25²) + 2π(25)(80) = 3927 + 12566 = 16493mm².",
        commonErrors: [
          "Using diameter instead of radius in the circumference formula.",
          "Forgetting the two circular ends.",
          "Not rounding consistently — state π to 4 significant figures for EGD."
        ]
      },
      {
        question: "Explain what 'true length' means in development drawings and why it is important.",
        steps: [
          "Define true length.",
          "Explain why projected lengths differ from true lengths.",
          "State how to find the true length of a slant line.",
          "Give an example."
        ],
        solution: "True length: the actual length of a line as it would be measured physically (not its projected length in an orthographic view). Importance: in development drawings, all surface dimensions must be true lengths to ensure the net folds into the correct 3D shape. How to find: for a slant edge, use the right-triangle method — the true length is the hypotenuse of a right triangle whose legs are the projected length and the height difference. Example: a slant line showing 40mm in plan and rising 30mm in elevation has true length = √(40²+30²) = 50mm.",
        commonErrors: [
          "Using projected lengths instead of true lengths — the net will not fold correctly.",
          "Confusing true length with the longest visible line in a drawing.",
          "No example calculation given."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Ontwikkel (ontvou) 'n regte vierkantige prisma met basis 40mm × 40mm en hoogte 60mm.",
        steps: [
          "Identifiseer die aantal reghoekige vlakke.",
          "Bereken die omtrek van die basis.",
          "Teken die vier reghoekige vlakke in 'n ry.",
          "Voeg die bo- en ondervierkantige vlakke by."
        ],
        solution: "Vierkantige prisma: 4 reghoekige sye en 2 vierkantige eindes. Totale breedte = omtrek = 4 × 40 = 160mm. Hoogte = 60mm. Teken 'n 160mm × 60mm reghoek verdeel in 4 gelyke 40mm afdelings. Heg 'n 40mm × 40mm vierkant aan elke einde.",
        commonErrors: [
          "Die twee vierkantige eindes vergeet.",
          "Breedte van ontwikkeling = een sykant (40mm) eerder as omtrek (160mm).",
          "Die eindevierkantige vlakke oorvleuel."
        ]
      },
      {
        question: "Wat is die ontwikkeling van 'n regte silinder met radius 25mm en hoogte 80mm? Gee alle berekeninge.",
        steps: [
          "Bereken die omtrek (breedte van reghoekige deel).",
          "Stel die hoogte van die reghoekige deel.",
          "Teken die reghoek.",
          "Teken die twee sirkeleinde."
        ],
        solution: "Omtrek = 2πr = 2 × π × 25 = 157.1mm (breedte). Hoogte = 80mm. Ontwikkeling: 'n reghoek 157.1mm breed × 80mm hoog, plus twee sirkels van radius 25mm.",
        commonErrors: [
          "Deursnee in plaas van radius in die omtrekformule gebruik.",
          "Die twee sirkeleinde vergeet.",
          "Nie konsekwent afrond nie."
        ]
      },
      {
        question: "Verduidelik wat 'ware lengte' in ontwikkelingstekenings beteken en waarom dit belangrik is.",
        steps: [
          "Definieer ware lengte.",
          "Verduidelik waarom geprojecteerde lengtes van ware lengtes verskil.",
          "Stel hoe om die ware lengte van 'n skuins lyn te vind.",
          "Gee 'n voorbeeld."
        ],
        solution: "Ware lengte: die werklike lengte van 'n lyn soos fisies gemeet. Belang: in ontwikkelingstekenings moet alle oppervlakafmetings ware lengtes wees. Hoe om te vind: regdriehoek-metode — ware lengte is die skuinssy van 'n regdriehoek met bene van die geprojecteerde lengte en hoogteverskil. Voorbeeld: skuins lyn 40mm in plan en 30mm styg het ware lengte = √(40²+30²) = 50mm.",
        commonErrors: [
          "Geprojecteerde lengtes in plaas van ware lengtes gebruik.",
          "Ware lengte met die langste sigbare lyn verwar.",
          "Geen voorbeeldberekening gee nie."
        ]
      }
    ]
  },

  "EGD-6": {
    workedExamplesEn: [
      {
        question: "Describe the locus of the midpoint of a rod of fixed length whose ends slide on two perpendicular axes.",
        steps: [
          "Set up the scenario: a rod of length 2a with ends on the x and y axes.",
          "Let the end on the x-axis be at (x, 0) and on the y-axis at (0, y).",
          "Express the midpoint coordinates.",
          "Derive the locus equation."
        ],
        solution: "Rod of length 2a: x = 2a·cos θ, y = 2a·sin θ (θ = angle rod makes with x-axis). Midpoint M = (a·cos θ, a·sin θ). Locus equation: (Mx/a)² + (My/a)² = cos²θ + sin²θ = 1 → Mx² + My² = a². The locus is a circle of radius a centred at the origin.",
        commonErrors: [
          "Not recognising the trigonometric parametric form.",
          "Calculating the full endpoint locus rather than the midpoint.",
          "Forgetting that the final shape is a circle (quarter arc visible in the first quadrant)."
        ]
      },
      {
        question: "A crank of radius 50mm rotates about a fixed centre. A follower point is 75mm from the centre along the connecting rod. Describe how to plot 6 positions of the follower.",
        steps: [
          "Draw the crank circle (radius 50mm).",
          "Divide the circle into 6 equal positions (60° apart).",
          "For each crank position, mark the crank pin location.",
          "Mark the follower point 75mm from the crank pin along the connecting rod direction.",
          "Connect the 6 follower positions with a smooth curve."
        ],
        solution: "Step 1: Draw a circle of radius 50mm (crank). Step 2: Mark 6 points at 0°, 60°, 120°, 180°, 240°, 300°. Step 3: At each position, the crank pin is on the circle. Step 4: The connecting rod extends 75mm from the crank pin (direction determined by the linkage geometry or given angle). Step 5: Plot follower positions 1–6. Step 6: Smooth curve through all 6 = approximate locus of the follower.",
        commonErrors: [
          "Using fewer than 6 positions — more positions give a more accurate curve.",
          "Measuring 75mm from the crank centre instead of the crank pin.",
          "Connecting points with straight lines instead of a smooth curve."
        ]
      },
      {
        question: "What is the locus of a point on the circumference of a circle of radius r rolling along a straight line? Describe the shape.",
        steps: [
          "Name the locus.",
          "Describe the shape qualitatively.",
          "State the parametric equations.",
          "State a practical application."
        ],
        solution: "Locus name: cycloid. Shape: a series of arcs that rise from the straight line, reach a peak at height 2r (the top of the circle), and return to the line after one full revolution. Parametric equations: x = r(θ − sin θ), y = r(1 − cos θ). The curve is cusped at the base line (where the point touches the ground) and smooth at the peak. Application: the design of gear teeth (involute is related to the cycloid) and road surfaces.",
        commonErrors: [
          "Confusing cycloid with ellipse.",
          "Saying the highest point is at r instead of 2r.",
          "No practical application given."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Beskryf die lokus van die middelpunt van 'n staaf van vaste lengte waarvan die eindes op twee loodreg asse skuif.",
        steps: [
          "Stel die scenario op: staaf van lengte 2a met eindes op die x- en y-asse.",
          "Laat die einde op die x-as by (x, 0) en op y-as by (0, y) wees.",
          "Druk die middelpuntkoördinate uit.",
          "Lei die lokus-vergelyking af."
        ],
        solution: "Staaf van lengte 2a: x = 2a·cos θ, y = 2a·sin θ. Middelpunt M = (a·cos θ, a·sin θ). Lokus: Mx² + My² = a². Die lokus is 'n sirkel van radius a om die oorsprong.",
        commonErrors: [
          "Die trigonometriese parametriese vorm nie herken nie.",
          "Die volledige eindpuntlokus eerder as middelpunt bereken.",
          "Vergeet dat die finale vorm 'n sirkel is."
        ]
      },
      {
        question: "Krukas van radius 50mm draai om 'n vaste middelpunt. 'n Volgerpunt is 75mm van die middelpunt af langs die dryfstang. Beskryf hoe om 6 posisies van die volger te plot.",
        steps: [
          "Teken die krukassirkel (radius 50mm).",
          "Verdeel die sirkel in 6 gelyke posisies (60° uitmekaar).",
          "Merk vir elke krukas-posisie die krukasspenplek.",
          "Merk die volgerpunt 75mm van die krukasspening af.",
          "Verbind die 6 volgerposisies met 'n gladde kurwe."
        ],
        solution: "Stap 1: Teken sirkel van 50mm. Stap 2: Merk 6 punte by 0°, 60°, 120°, 180°, 240°, 300°. Stap 3: Krukasspening is op die sirkel. Stap 4: Dryfstang verleng 75mm van die spening. Stap 5: Plot volgerposisies 1–6. Stap 6: Gladde kurwe deur alle 6 = benaderde lokus.",
        commonErrors: [
          "Minder as 6 posisies gebruik.",
          "75mm van die krukasmiddelpunt eerder as krukasspening meet.",
          "Punte met reguitlyne verbind."
        ]
      },
      {
        question: "Wat is die lokus van 'n punt op die omtrek van 'n sirkel van radius r wat langs 'n reguitlyn rol? Beskryf die vorm.",
        steps: [
          "Noem die lokus.",
          "Beskryf die vorm kwalitatief.",
          "Stel die parametriese vergelykings.",
          "Stel 'n praktiese toepassing."
        ],
        solution: "Lokus: sikloid. Vorm: 'n reeks boë wat van die reguitlyn styg, 'n hoogtepunt bereik by 2r, en na een volle wenteling terugkeer. Parametriese vergelykings: x = r(θ − sin θ), y = r(1 − cos θ). Die kurwe is skerp by die basislyn en glad by die hoogtepunt. Toepassing: ontwerp van tandwieltande.",
        commonErrors: [
          "Sikloid met ellips verwar.",
          "Sê die hoogste punt is by r in plaas van 2r.",
          "Geen praktiese toepassing gee nie."
        ]
      }
    ]
  },

  // ===================== AGRICULTURAL SCIENCES (AGR) =====================

  "AGR-1": {
    workedExamplesEn: [
      {
        question: "Apply the four management functions (POLC) to a decision about whether to buy a new tractor.",
        steps: [
          "Planning: identify the need and set objectives.",
          "Organising: determine resources required.",
          "Leading: motivate and communicate the decision.",
          "Controlling: monitor outcomes against targets."
        ],
        solution: "Planning: the farm's current tractor breaks down frequently, reducing harvest efficiency by 30% — objective: reduce downtime to <5%. Organising: budget R450 000; source financing from Land Bank; schedule delivery before planting season. Leading: inform and train the tractor operator on the new machine. Controlling: track fuel efficiency, maintenance costs and harvest output monthly; compare to pre-purchase figures.",
        commonErrors: [
          "Listing POLC functions without applying them to the tractor decision.",
          "Confusing 'planning' (setting goals) with 'organising' (allocating resources).",
          "No controlling step — monitoring is essential for management decisions."
        ]
      },
      {
        question: "Calculate the break-even point for a farmer who sells maize at R3 000/tonne, with fixed costs of R120 000 and variable costs of R1 200/tonne.",
        steps: [
          "Identify the contribution margin per unit.",
          "Apply the break-even formula.",
          "Interpret the result."
        ],
        solution: "Contribution margin = Selling price − Variable cost = R3 000 − R1 200 = R1 800/tonne. Break-even quantity = Fixed costs ÷ Contribution margin = R120 000 ÷ R1 800 = 66.67 tonnes ≈ 67 tonnes. Interpretation: the farmer must sell at least 67 tonnes of maize before making any profit.",
        commonErrors: [
          "Using total revenue instead of selling price per unit.",
          "Not dividing by contribution margin (subtracting variable costs from fixed costs instead).",
          "Not interpreting the result — the number alone earns partial credit."
        ]
      },
      {
        question: "Distinguish between short-term, medium-term and long-term agricultural planning with one example of each.",
        steps: [
          "Define short-term planning → example.",
          "Define medium-term planning → example.",
          "Define long-term planning → example."
        ],
        solution: "Short-term (1 year or less): day-to-day and seasonal decisions. Example: deciding when to plant maize based on weather forecasts. Medium-term (1–5 years): investment and growth decisions. Example: purchasing an irrigation system to expand the irrigated area. Long-term (5+ years): structural and strategic decisions. Example: converting 50 hectares from dryland maize to an avocado orchard.",
        commonErrors: [
          "Confusing medium-term with short-term — the time horizon must be specified.",
          "No example given for any category.",
          "Treating long-term planning as simply 'bigger' short-term planning."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Pas die vier bestuursfunksies (POLB) toe op 'n besluit om 'n nuwe trekker te koop.",
        steps: [
          "Beplanning: identifiseer die behoefte en stel doelwitte.",
          "Organisering: bepaal benodigde hulpbronne.",
          "Leiding: motiveer en kommunikeer die besluit.",
          "Beheer: monitor uitkomste teen teikens."
        ],
        solution: "Beplanning: huidige trekker breek gereeld af, wat oesvermoeë met 30% verminder — doelwit: stilstand tot <5% verminder. Organisering: begroting R450 000; finansiering by Landbank. Leiding: trekkeroperateur oplei. Beheer: brandstofverbruik, instandhoudingskoste maandeliks volg.",
        commonErrors: [
          "POLB-funksies lys sonder toepassing.",
          "'Beplanning' met 'organisering' verwar.",
          "Geen beheerstap nie."
        ]
      },
      {
        question: "Bereken die gelykbreekpunt vir 'n boer wat mielies teen R3 000/ton verkoop, met vaste koste van R120 000 en veranderlike koste van R1 200/ton.",
        steps: [
          "Identifiseer die bydraemarge per eenheid.",
          "Pas die gelykbreekformule toe.",
          "Interpreteer die resultaat."
        ],
        solution: "Bydraemarge = Verkoopprys − Veranderlike koste = R3 000 − R1 200 = R1 800/ton. Gelykbreek hoeveelheid = Vaste koste ÷ Bydraemarge = R120 000 ÷ R1 800 = 66.67 ton ≈ 67 ton. Interpretasie: die boer moet ten minste 67 ton mielies verkoop voor enige wins.",
        commonErrors: [
          "Totale inkomste in plaas van verkoopprys per eenheid gebruik.",
          "Nie deur bydraemarge deel nie.",
          "Die resultaat nie interpreteer nie."
        ]
      },
      {
        question: "Onderskei tussen kort-, medium- en langtermyn landbou-beplanning met een voorbeeld van elk.",
        steps: [
          "Definieer korttermyn → voorbeeld.",
          "Definieer mediumtermyn → voorbeeld.",
          "Definieer langtermyn → voorbeeld."
        ],
        solution: "Korttermyn (1 jaar of minder): dag-tot-dag en seisoenale besluite. Voorbeeld: besluit wanneer om mielies te plant. Mediumtermyn (1–5 jaar): investering en groeibesluite. Voorbeeld: aankoop van 'n besproeiingstelsel. Langtermyn (5+ jaar): strukturele en strategiese besluite. Voorbeeld: omskakel van drooglandmielies na 'n avokadoboord.",
        commonErrors: [
          "Mediumtermyn met korttermyn verwar.",
          "Geen voorbeeld vir enige kategorie nie.",
          "Langtermyn behandel as bloot 'groter' korttermyn."
        ]
      }
    ]
  },

  "AGR-2": {
    workedExamplesEn: [
      {
        question: "Compare intensive and extensive livestock production systems in terms of land use, input costs and product quality.",
        steps: [
          "Define intensive system → land, cost, quality.",
          "Define extensive system → land, cost, quality.",
          "Give a South African example of each."
        ],
        solution: "Intensive: high stocking density on small area; high input costs (feed, housing, medication); consistent, standardised product quality. SA example: commercial broiler (chicken) houses. Extensive: low stocking density on large natural veld; low input costs (animals graze); variable product quality (grass-fed beef). SA example: Karoo sheep farming on natural rangeland.",
        commonErrors: [
          "Confusing intensive with 'better' — each system has trade-offs.",
          "No SA examples.",
          "Not addressing all three dimensions (land, cost, quality)."
        ]
      },
      {
        question: "Describe the beef cattle production cycle from birth to market, naming the key stages.",
        steps: [
          "Stage 1: Breeding.",
          "Stage 2: Calving and calf rearing.",
          "Stage 3: Weaning.",
          "Stage 4: Backgrounding/growing.",
          "Stage 5: Finishing and slaughter."
        ],
        solution: "Stage 1 Breeding: bull or AI used 6–8 weeks per season; calving rate target 85%+. Stage 2 Calving: calf born ~9 months after conception; colostrum critical in first 6 hours. Stage 3 Weaning: calf removed from cow at 5–7 months (140–200kg). Stage 4 Growing: backgrounding on pasture or feedlot until 300–350kg. Stage 5 Finishing: feedlot ration for 90–120 days to reach slaughter weight 450–550kg; Grade A carcass target.",
        commonErrors: [
          "Omitting the weaning stage.",
          "Confusing backgrounding (growth phase) with finishing (fat deposition).",
          "No target weights or periods given — specific data strengthens answers."
        ]
      },
      {
        question: "Explain why Merino sheep are well-suited to the Karoo environment in South Africa.",
        steps: [
          "Describe the Karoo's climate and vegetation.",
          "List Merino characteristics that suit this environment.",
          "Link each characteristic to the environment."
        ],
        solution: "Karoo: arid to semi-arid; sparse, low-quality Karoo scrub vegetation; hot summers, cold winters. Merino characteristics: efficient at extracting nutrients from low-quality sparse forage; can travel long distances to water (low water requirements); fine wool production is valuable even on poor veld; hardy and disease-resistant. Link: their physiological efficiency compensates for the limited feed resources of the Karoo.",
        commonErrors: [
          "Describing Merino characteristics without linking to the Karoo environment.",
          "Confusing Merino (wool) with Dorper (meat) — both are common in SA.",
          "No description of the Karoo environment."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Vergelyk intensiewe en ekstensiewe veeproduksie-stelsels ten opsigte van grondgebruik, insette koste en produkgehalte.",
        steps: [
          "Definieer intensief → grond, koste, gehalte.",
          "Definieer ekstensief → grond, koste, gehalte.",
          "Gee 'n Suid-Afrikaanse voorbeeld van elk."
        ],
        solution: "Intensief: hoë aantaldigtheid op klein area; hoë insetkoste (voer, behuising); konsekwente produkgehalte. SA-voorbeeld: kommersiële braaikuikens. Ekstensief: lae aantaldigtheid op groot veld; lae insetkoste (diere wei); veranderlike produkgehalte. SA-voorbeeld: Karoo-skaapboerdery.",
        commonErrors: [
          "Intensief as 'beter' behandel.",
          "Geen SA-voorbeelde nie.",
          "Nie alle drie dimensies aanspreek nie."
        ]
      },
      {
        question: "Beskryf die beesvee-produksiesiklus van geboorte tot mark en noem die sleutelfases.",
        steps: [
          "Fase 1: Teling.",
          "Fase 2: Kalf en kalf-grootmaak.",
          "Fase 3: Speen.",
          "Fase 4: Agtergronding/groei.",
          "Fase 5: Afronding en slag."
        ],
        solution: "Fase 1 Teling: bul of KI gebruik; telfrequensie teiken 85%+. Fase 2 Kalwing: kalf gebore ~9 maande na konsepsie; bies kritiek in eerste 6 uur. Fase 3 Speen: kalf verwyder van koei teen 5–7 maande (140–200kg). Fase 4 Groei: voerkraal tot 300–350kg. Fase 5 Afronding: voerkraalrantsoen 90–120 dae tot slaggewig 450–550kg.",
        commonErrors: [
          "Die spaenfase weglaat.",
          "Agtergronding met afronding verwar.",
          "Geen teikenmassas of periodes gee nie."
        ]
      },
      {
        question: "Verduidelik waarom Merino-skape goed by die Karoo-omgewing in Suid-Afrika pas.",
        steps: [
          "Beskryf die Karoo se klimaat en plantegroei.",
          "Lys Merino-kenmerke wat by hierdie omgewing pas.",
          "Koppel elke kenmerk aan die omgewing."
        ],
        solution: "Karoo: droog tot semi-droog; yl, lae-gehalte skrubbplantegroei; warm somers, koue winters. Merino-kenmerke: doeltreffend in lae-gehalte voeding; kan lang afstande na water reis; fynwol is waardevol selfs op arm veld; geharde en siektebestande. Koppeling: hul fisiologiese doeltreffendheid vergoed vir beperkte voedingshulpbronne.",
        commonErrors: [
          "Merino-kenmerke beskryf sonder aan Karoo te koppel.",
          "Merino (wol) met Dorper (vleis) verwar.",
          "Geen beskrywing van die Karoo-omgewing nie."
        ]
      }
    ]
  },

  "AGR-3": {
    workedExamplesEn: [
      {
        question: "Explain the difference between a monogastric and a ruminant digestive system with reference to cellulose digestion.",
        steps: [
          "Define monogastric and name an example animal.",
          "Define ruminant and name an example animal.",
          "Explain how each handles cellulose.",
          "State the practical feeding implication."
        ],
        solution: "Monogastric: one-stomach digestive system (e.g. pig, chicken). Cannot digest cellulose — lacks the necessary cellulase enzyme and microbial fermentation chamber. Must be fed easily digestible grains and concentrates. Ruminant: four-stomach system with a rumen (e.g. cow, sheep). Rumen harbours symbiotic bacteria that ferment cellulose into volatile fatty acids (VFAs) used as energy. Practical implication: ruminants can subsist on high-fibre roughage (grass, hay); monogastrics cannot.",
        commonErrors: [
          "Stating ruminants have 'four stomachs' — they have one true stomach (abomasum) and three fore-stomachs.",
          "Confusing VFAs with glucose — VFAs are the primary energy source in ruminants, not glucose.",
          "No practical feeding implication given."
        ]
      },
      {
        question: "Calculate the crude protein (CP) percentage in a feed ration of 500g maize (8% CP) and 200g soybean meal (46% CP).",
        steps: [
          "Calculate grams of CP from maize.",
          "Calculate grams of CP from soybean meal.",
          "Calculate total CP and total ration mass.",
          "Calculate CP percentage of the total ration."
        ],
        solution: "CP from maize = 500 × 0.08 = 40g. CP from soybean = 200 × 0.46 = 92g. Total CP = 40 + 92 = 132g. Total ration = 500 + 200 = 700g. CP% = (132 ÷ 700) × 100 = 18.86% ≈ 18.9%.",
        commonErrors: [
          "Adding the percentages directly (8% + 46% = 54%) — percentages must be weighted by mass.",
          "Not converting percentage to decimal before multiplying.",
          "Forgetting to express the final answer as a percentage."
        ]
      },
      {
        question: "Name and describe three functions of protein in livestock nutrition.",
        steps: [
          "Function 1: state and explain.",
          "Function 2: state and explain.",
          "Function 3: state and explain."
        ],
        solution: "1. Growth and tissue repair: amino acids (from protein) are building blocks for muscle, organs and connective tissue — essential for young growing animals. 2. Enzyme and hormone synthesis: enzymes (e.g. digestive enzymes) and hormones (e.g. insulin) are proteins that regulate metabolic processes. 3. Immune function: antibodies are proteins that neutralise pathogens — adequate protein is essential for disease resistance.",
        commonErrors: [
          "Stating energy as a primary function — fat and carbohydrates are preferred energy sources; protein is a costly last resort.",
          "Only one function given.",
          "Describing functions without explaining the mechanism."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die verskil tussen 'n eenmagige en 'n herkouerdige stelsel met verwysing na sellulosevertering.",
        steps: [
          "Definieer eenmagige en noem 'n voorbeeld.",
          "Definieer herkouerdige en noem 'n voorbeeld.",
          "Verduidelik hoe elkeen selluloos hanteer.",
          "Stel die praktiese voedingsimplikasie."
        ],
        solution: "Eenmagige: eenmaagverteringstelsel (bv. vark, hoender). Kan selluloos nie verteer nie — geen sellulase-ensiem of mikrobiese fermenteringskamer. Herkouerdige: viermaagse stelsel met 'n pens (bv. bees, skaap). Pens bevat simbiotiese bakterieë wat selluloos fermenteer tot vlugtige vetsure (VVS) as energie. Praktiese implikasie: herkouers kan op hoëvesel-ruwvoer leef; eenmagiges nie.",
        commonErrors: [
          "Sê herkouers het 'vier mae' — hulle het een ware maag en drie voormaë.",
          "VVS met glukose verwar.",
          "Geen praktiese voedingsimplikasie nie."
        ]
      },
      {
        question: "Bereken die ruproteïen (RP) persentasie in 'n voerrantsoen van 500g mielies (8% RP) en 200g sojaboontjiekoek (46% RP).",
        steps: [
          "Bereken gram RP van mielies.",
          "Bereken gram RP van sojaboontjiekoek.",
          "Bereken totale RP en totale ransoenmas.",
          "Bereken RP% van die totale rantsoen."
        ],
        solution: "RP van mielies = 500 × 0.08 = 40g. RP van soja = 200 × 0.46 = 92g. Totale RP = 40 + 92 = 132g. Totale rantsoen = 700g. RP% = (132 ÷ 700) × 100 = 18.9%.",
        commonErrors: [
          "Persentasies direk optelling (8% + 46%).",
          "Persentasie nie na desimaal omskakel voor vermenigvuldiging nie.",
          "Vergeet om die finale antwoord as persentasie uit te druk."
        ]
      },
      {
        question: "Noem en beskryf drie funksies van proteïen in vee-voeding.",
        steps: [
          "Funksie 1: stel en verduidelik.",
          "Funksie 2: stel en verduidelik.",
          "Funksie 3: stel en verduidelik."
        ],
        solution: "1. Groei en weefselherstel: aminosure is boublokke vir spiere, organe en bindweefsel. 2. Ensiem- en hormoon-sintese: ensieme en hormone reguleer metaboliese prosesse. 3. Immuunfunksie: teenliggame is proteïene wat patogene neutraliseer.",
        commonErrors: [
          "Energie as primêre funksie stel.",
          "Slegs een funksie gee.",
          "Funksies beskryf sonder die meganisme te verduidelik."
        ]
      }
    ]
  },

  "AGR-4": {
    workedExamplesEn: [
      {
        question: "Explain the oestrous cycle of a cow, including cycle length, signs of oestrus, and the optimal time for artificial insemination (AI).",
        steps: [
          "State the cycle length.",
          "List three signs of oestrus.",
          "State the optimal AI timing.",
          "Explain why timing matters."
        ],
        solution: "Cycle length: 21 days (range 18–24). Signs of oestrus: 1. Standing heat — cow stands still when mounted by herdmates (most reliable sign). 2. Mucous discharge from vulva. 3. Restlessness, decreased milk production. Optimal AI timing: 12–18 hours after the onset of standing heat. Why: ovulation occurs approximately 30 hours after the start of oestrus; AI performed 12–18 hours before ovulation allows sperm to capacitate and be in position.",
        commonErrors: [
          "Stating the cycle is 28 days — that is the human cycle; bovine is 21 days.",
          "Recommending AI at the first sign of heat — too early reduces conception rate.",
          "No explanation of why timing matters."
        ]
      },
      {
        question: "Describe the process and advantages of artificial insemination (AI) in cattle production.",
        steps: [
          "Describe the AI process.",
          "Give three advantages of AI over natural mating."
        ],
        solution: "AI process: 1. Detect oestrus (heat detection). 2. Thaw a straw of frozen semen from a high-genetic-merit bull in a 35°C water bath. 3. Load into an AI gun. 4. Insert through the cervix using a rectal-vaginal technique. 5. Deposit semen in the body of the uterus. Advantages: 1. One superior bull can sire thousands of offspring per year (natural: 40–50). 2. Reduces disease transmission (no bull-to-cow contact). 3. Access to international genetics without importing a bull.",
        commonErrors: [
          "Describing AI as 'mixing blood' — no blood is involved.",
          "Fewer than 3 advantages.",
          "No process description."
        ]
      },
      {
        question: "Calculate the expected calving date if a cow was inseminated on 1 March, given the bovine gestation period is 282 days.",
        steps: [
          "Identify the insemination date.",
          "Add the gestation period.",
          "Calculate the expected calving date."
        ],
        solution: "Insemination: 1 March. Gestation: 282 days. Calculation: March has 31 days, so from 1 March + 282 days: March 1 + 30 = 31 March (30 days). April: +30 = 30 April (60 days). May: +31 = 31 May (91 days). June: +30 = 30 June (121 days). July: +31 = 31 July (152 days). August: +31 = 31 August (183 days). September: +30 = 30 September (213 days). October: +31 = 31 October (244 days). November: +30 = 30 November (274 days). Remaining: 282 − 274 = 8 → 8 December. Expected calving: approximately 8 December.",
        commonErrors: [
          "Using 270 days (human gestation) instead of 282 days.",
          "Arithmetic errors in month-by-month addition.",
          "Not accounting for the varying number of days in each month."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die brunsiklus van 'n koei, insluitend siklus lengte, tekens van brun, en optimale KI-tyd.",
        steps: [
          "Stel die siklus lengte.",
          "Lys drie tekens van brun.",
          "Stel optimale KI-tyd.",
          "Verduidelik waarom tyd saak maak."
        ],
        solution: "Siklus lengte: 21 dae (reeks 18–24). Tekens: 1. Staanbrun — koei staan stil terwyl kuddemate ryg (betroubaarsste teken). 2. Slymafloeiing van vulva. 3. Rusteloosheid, verminderde melkproduksie. Optimale KI: 12–18 uur na aanvang van staanbrun. Waarom: ovulasie vind ±30 uur na bruns-aanvang plaas.",
        commonErrors: [
          "Siklus 28 dae stel.",
          "KI by die eerste teken van brun aanbeveel.",
          "Geen verduideliking waarom tyd saak maak nie."
        ]
      },
      {
        question: "Beskryf die proses en voordele van kunsmatige inseminasie (KI) in beesvee-produksie.",
        steps: [
          "Beskryf die KI-proses.",
          "Gee drie voordele van KI bo natuurlike paring."
        ],
        solution: "KI-proses: 1. Brun-opsporing. 2. Ontdooi spermastrootjie in 35°C waterbad. 3. Laai in KI-geweer. 4. Voer deur die serviks in. 5. Depositeer sperm in die uterus. Voordele: 1. Een bulle kan duisende nageslag jaarliks verwek. 2. Verminder siekteoordrag. 3. Toegang tot internasionale genetika.",
        commonErrors: [
          "KI as 'bloed meng' beskryf.",
          "Minder as 3 voordele.",
          "Geen prosesbeskrywing nie."
        ]
      },
      {
        question: "Bereken die verwagte kalf-datum as 'n koei op 1 Maart bevrugtig is, met gestation van 282 dae.",
        steps: [
          "Identifiseer die bevrugtingsdatum.",
          "Voeg die gestation by.",
          "Bereken die verwagte kalwingsdatum."
        ],
        solution: "Bevrugting: 1 Maart. Gestation: 282 dae. Berekening: +30 = 31 Maart, +30 = 30 April, +31 = 31 Mei, +30 = 30 Junie, +31 = 31 Julie, +31 = 31 Aug, +30 = 30 Sep, +31 = 31 Okt, +30 = 30 Nov (274 dae). Oorblywende: 282 − 274 = 8 → 8 Desember.",
        commonErrors: [
          "270 dae (menslike gestation) gebruik.",
          "Rekenkundige foute in maand-vir-maand optelling.",
          "Nie die verskillende aantal dae per maand in ag neem nie."
        ]
      }
    ]
  },

  "AGR-5": {
    workedExamplesEn: [
      {
        question: "Explain integrated pest management (IPM) and describe how a farmer would apply it to a maize crop.",
        steps: [
          "Define IPM.",
          "Step 1: Cultural control method.",
          "Step 2: Biological control method.",
          "Step 3: Chemical control as a last resort.",
          "State the advantage of IPM over chemical-only control."
        ],
        solution: "IPM: a sustainable approach that combines multiple pest-control methods to minimise environmental impact and resistance. Cultural control: crop rotation — plant soybeans after maize to break the maize stalk borer life cycle. Biological control: release Trichogramma wasps that parasitise maize stalk borer eggs. Chemical control: if infestation exceeds the economic threshold, apply a targeted insecticide (e.g. chlorpyrifos) at the correct time. Advantage: reduces pesticide resistance development, protects beneficial insects and pollinators.",
        commonErrors: [
          "Describing only chemical control — IPM specifically reduces reliance on chemicals.",
          "No threshold concept — chemical control in IPM is triggered by economic thresholds, not at first pest sighting.",
          "No advantage stated."
        ]
      },
      {
        question: "Calculate the irrigation water requirement for a maize field of 5 hectares if the daily evapotranspiration is 6 mm/day and rain provides 2 mm/day.",
        steps: [
          "Calculate the net water deficit per day.",
          "Convert mm/day to litres/hectare/day.",
          "Calculate the total volume for 5 hectares."
        ],
        solution: "Net deficit = ET − Rainfall = 6 − 2 = 4 mm/day. 1 mm/hectare = 10 000 litres (1 mm × 10 000 m² × 0.001 m = 10 m³ = 10 000L). Water per hectare per day = 4 × 10 000 = 40 000 L/ha/day. Total for 5 ha = 40 000 × 5 = 200 000 L/day = 200 m³/day.",
        commonErrors: [
          "Using 1 000 L/mm/ha instead of 10 000 L/mm/ha.",
          "Not subtracting rainfall from ET.",
          "Not multiplying by the number of hectares."
        ]
      },
      {
        question: "Describe three common pests of vegetable crops in South Africa and one control method for each.",
        steps: [
          "Pest 1 → control.",
          "Pest 2 → control.",
          "Pest 3 → control."
        ],
        solution: "1. Whitefly (Bemisia tabaci): causes direct feeding damage and transmits leaf-curl virus → Control: yellow sticky traps (monitoring), neem oil spray, or systemic insecticide. 2. Aphids: suck sap, excrete honeydew, transmit viruses → Control: introduce ladybird beetles (biological control) or apply insecticidal soap. 3. Tomato leaf miner (Tuta absoluta): larvae tunnel into leaves and fruit → Control: pheromone traps (monitoring), remove infested plant parts, apply spinosad.",
        commonErrors: [
          "Naming pests without control methods.",
          "Recommending chemical control only.",
          "Confusing aphids with whitefly."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik geïntegreerde plaagbestuur (GPB) en beskryf hoe 'n boer dit op 'n mieliegewas sou toepas.",
        steps: [
          "Definieer GPB.",
          "Stap 1: Kulturele beheermetode.",
          "Stap 2: Biologiese beheermetode.",
          "Stap 3: Chemiese beheer as laaste toevlug.",
          "Stel die voordeel van GPB."
        ],
        solution: "GPB: 'n volhoubare benadering wat meerdere plaagbeheermetodes kombineer. Kulturele beheer: gewasrotasie — plant sojaboontjies na mielies om die stingelboorlewe-siklus te breek. Biologiese beheer: vrystel Trichogramma-wespe wat mielieborereiers parasiteer. Chemiese beheer: as plaag ekonomiese drempel oorskry, pas teiken-insektisied toe. Voordeel: verminder pesticiedweerstand en beskerm nuttige insekte.",
        commonErrors: [
          "Slegs chemiese beheer beskryf.",
          "Geen drempelkonsep nie.",
          "Geen voordeel stel nie."
        ]
      },
      {
        question: "Bereken die besproeiingswatervereiste vir 'n mielieveld van 5 hektaar as daaglikse evapotranspirasie 6 mm/dag is en reën 2 mm/dag verskaf.",
        steps: [
          "Bereken die netto watertekort per dag.",
          "Skakel mm/dag na liter/hektaar/dag om.",
          "Bereken die totale volume vir 5 hektaar."
        ],
        solution: "Netto tekort = ET − Reënval = 6 − 2 = 4 mm/dag. 1 mm/hektaar = 10 000 liter. Water per hektaar per dag = 4 × 10 000 = 40 000 L/ha/dag. Totaal vir 5 ha = 40 000 × 5 = 200 000 L/dag = 200 m³/dag.",
        commonErrors: [
          "1 000 L/mm/ha in plaas van 10 000 gebruik.",
          "Reënval nie van ET aftrek nie.",
          "Nie met die aantal hektare vermenigvuldig nie."
        ]
      },
      {
        question: "Beskryf drie algemene plae van groentegwasse in Suid-Afrika en een beheermetode vir elk.",
        steps: [
          "Plaag 1 → beheer.",
          "Plaag 2 → beheer.",
          "Plaag 3 → beheer."
        ],
        solution: "1. Witvlieg (Bemisia tabaci): vreet en dra blaarrolvirusse oor → Beheer: geel kleefstrikke, neemolie. 2. Luise: suig sap, skei heuningdou af → Beheer: stel lieweheersbeestjies vry of gebruik insektisiedale seep. 3. Tamatiemynwerker (Tuta absoluta): larwes tonneleer in blare → Beheer: feromoonvalle, verwyder aangetaste plantdele.",
        commonErrors: [
          "Plae noem sonder beheermetodes.",
          "Slegs chemiese beheer aanbeveel.",
          "Luise en witvlieë verwar."
        ]
      }
    ]
  },

  "AGR-6": {
    workedExamplesEn: [
      {
        question: "Describe the process of soil formation (pedogenesis) and name four factors that influence it.",
        steps: [
          "Define pedogenesis.",
          "Name four factors.",
          "Explain how each factor influences soil formation."
        ],
        solution: "Pedogenesis: the natural process of soil formation from parent material over time. Factors: 1. Parent material: determines mineral composition — granite weathers to sandy soils; shale to clay-rich soils. 2. Climate: rainfall promotes weathering and leaching; temperature affects decomposition rate. 3. Organisms: plants add organic matter; earthworms mix and aerate soil. 4. Topography: steep slopes cause erosion (thin soils); valley bottoms accumulate material (deep soils). 5. Time: thousands of years needed for full soil profile development.",
        commonErrors: [
          "Listing only 2–3 factors when 4 are required.",
          "Not explaining HOW each factor influences soil — naming is insufficient.",
          "Confusing parent material with the soil itself."
        ]
      },
      {
        question: "Explain soil pH and describe how acidic and alkaline soils affect nutrient availability for plants.",
        steps: [
          "Define soil pH and the scale.",
          "Describe effect of low pH (acidic) on nutrients.",
          "Describe effect of high pH (alkaline) on nutrients.",
          "State how to correct each extreme."
        ],
        solution: "Soil pH: a logarithmic scale measuring hydrogen ion concentration; range 0–14, neutral = 7. Acidic (pH <6): aluminium and manganese become toxic; phosphorus and molybdenum become unavailable; most crops suffer at pH <5.5. Alkaline (pH >7.5): iron, manganese, zinc, copper and boron become insoluble and unavailable. Correction: acidic soils → lime application (CaCO₃); alkaline soils → sulfur application or irrigation with acidified water.",
        commonErrors: [
          "Stating acidic soils always have low nutrients — some nutrients increase in availability at low pH.",
          "Confusing the correction (lime for acid, sulfur for alkaline) — common reversal error.",
          "Not specifying which nutrients are affected at each extreme."
        ]
      },
      {
        question: "Describe three methods of soil conservation and explain why each is effective.",
        steps: [
          "Method 1 → effectiveness.",
          "Method 2 → effectiveness.",
          "Method 3 → effectiveness."
        ],
        solution: "1. Contour ploughing: ploughing along the contour (not up-down slope) creates ridges that slow runoff and trap water. Effective: reduces surface erosion velocity, increases water infiltration. 2. Cover crops: planting a legume between seasons keeps the soil covered. Effective: root systems bind soil particles, leaves intercept raindrop impact. 3. Terracing: cutting horizontal platforms into a slope. Effective: converts steep, erosion-prone hillsides into level or gently sloped planting areas, dramatically reducing runoff velocity.",
        commonErrors: [
          "Only one method given.",
          "No explanation of effectiveness — naming alone scores partial marks.",
          "Confusing contour ploughing with strip cropping."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Beskryf die proses van grondvorming (pedogenese) en noem vier faktore wat dit beïnvloed.",
        steps: [
          "Definieer pedogenese.",
          "Noem vier faktore.",
          "Verduidelik hoe elke faktor grondvorming beïnvloed."
        ],
        solution: "Pedogenese: die natuurlike proses van grondvorming uit moedermateriaal oor tyd. Faktore: 1. Moedermateriaal: bepaal mineraal-samestelling. 2. Klimaat: reënval bevorder verwering; temperatuur beïnvloed ontbinding. 3. Organismes: plante voeg organiese stof by; erdwurms meng en lugtig. 4. Topografie: steil hellings veroorsaak erosie; valleibodems versamel materiaal.",
        commonErrors: [
          "Slegs 2–3 faktore lys.",
          "Nie verduidelik HOE elkeen grond beïnvloed nie.",
          "Moedermateriaal met grond self verwar."
        ]
      },
      {
        question: "Verduidelik grond-pH en beskryf hoe suur en alkaliese gronde voedingstofbeskikbaarheid beïnvloed.",
        steps: [
          "Definieer grond-pH.",
          "Beskryf effek van lae pH op voedingstowwe.",
          "Beskryf effek van hoë pH op voedingstowwe.",
          "Stel hoe elkeen reggestel word."
        ],
        solution: "Grond-pH: logaritmiese skaal wat waterstofionenkonsentrasie meet; 0–14, neutraal = 7. Suur (pH <6): aluminium en mangaan word giftig; fosfaat en molibdeen word onbeskikbaar. Alkalisie (pH >7.5): yster, mangaan, sink, koper en boor word onoplosbaar. Korreksie: suur gronde → kalking; alkaliese gronde → swael.",
        commonErrors: [
          "Sê suur gronde het altyd lae voedingstowwe.",
          "Korreksie verwar (kalk vir suur, swael vir alkalisies).",
          "Nie spesifiseer watter voedingstowwe by elke ekstreme beïnvloed word nie."
        ]
      },
      {
        question: "Beskryf drie metodes van grondbewaring en verduidelik waarom elkeen doeltreffend is.",
        steps: [
          "Metode 1 → doeltreffendheid.",
          "Metode 2 → doeltreffendheid.",
          "Metode 3 → doeltreffendheid."
        ],
        solution: "1. Kontoerploeg: ploeg langs die kontoer skep riante wat afloop vertraag. Doeltreffend: verminder oppervlak erosiesnelheid. 2. Bedekkingsgewasse: aanplanting van 'n peulgewas tussen seisoene. Doeltreffend: wortels bind grondpartikels. 3. Terrassering: horisontale platforms in 'n helling sny. Doeltreffend: verminder afloopsnelheid drasties.",
        commonErrors: [
          "Slegs een metode gee.",
          "Geen verduideliking van doeltreffendheid nie.",
          "Kontoerploeg met strookverbouing verwar."
        ]
      }
    ]
  },

  "AGR-7": {
    workedExamplesEn: [
      {
        question: "Using a supply and demand diagram, explain what happens to the price of tomatoes when there is a prolonged drought.",
        steps: [
          "Draw an initial supply and demand diagram.",
          "Explain the effect of drought on supply.",
          "Shift the supply curve.",
          "Identify the new equilibrium price and quantity."
        ],
        solution: "Initial equilibrium: supply (S1) and demand (D1) intersect at price P1 and quantity Q1. Effect of drought: supply decreases (drought reduces yields) — supply curve shifts left from S1 to S2. New equilibrium: the new intersection at P2 (higher price) and Q2 (lower quantity). Conclusion: price of tomatoes rises; quantity sold decreases. This is a supply-side shock.",
        commonErrors: [
          "Shifting the demand curve instead of the supply curve.",
          "Shifting supply to the right (increase) instead of left (decrease).",
          "Not labelling the new equilibrium point."
        ]
      },
      {
        question: "Explain three marketing channels available to a vegetable farmer and state one advantage of each.",
        steps: [
          "Channel 1 → advantage.",
          "Channel 2 → advantage.",
          "Channel 3 → advantage."
        ],
        solution: "1. Fresh produce market (e.g. Johannesburg Market): farmer sells to agents who sell to retailers. Advantage: access to a large, centralised buyer base. 2. Direct farm stall: farmer sells directly to consumers. Advantage: maximum price per unit — no middlemen. 3. Contract farming (supermarket chain): farmer agrees to supply a fixed quantity at a fixed price. Advantage: guaranteed income and price certainty for planning.",
        commonErrors: [
          "Only one or two channels given.",
          "No advantage stated for any channel.",
          "Confusing a marketing channel with a marketing strategy."
        ]
      },
      {
        question: "Calculate the net farm income for a maize farmer: Gross Revenue = R800 000, Fixed costs = R200 000, Variable costs = R350 000.",
        steps: [
          "Calculate total costs.",
          "Calculate net farm income (profit).",
          "Interpret the result."
        ],
        solution: "Total costs = Fixed + Variable = R200 000 + R350 000 = R550 000. Net farm income = Gross Revenue − Total costs = R800 000 − R550 000 = R250 000. Interpretation: the farmer made a profit of R250 000 for the season. This covers the farmer's own labour and management — a positive return.",
        commonErrors: [
          "Only subtracting variable costs (forgetting fixed costs).",
          "Confusing gross revenue with net income.",
          "No interpretation of the result."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik deur 'n aanbod-en-vraag-diagram wat gebeur met die prys van tamaties tydens 'n langdurige droogte.",
        steps: [
          "Teken 'n aanvanklike vraag-en-aanbod-diagram.",
          "Verduidelik die effek van droogte op aanbod.",
          "Verskuif die aanbodkurwe.",
          "Identifiseer die nuwe ewewigsprys en hoeveelheid."
        ],
        solution: "Aanvanklike ewewig: S1 en D1 kruis by prys P1 en hoeveelheid Q1. Effek van droogte: aanbod verminder — aanbodkurwe verskuif links van S1 na S2. Nuwe ewewig: by P2 (hoër prys) en Q2 (laer hoeveelheid). Gevolgtrekking: prys van tamaties styg; hoeveelheid verkoop daal.",
        commonErrors: [
          "Die vraagkurwe in plaas van aanbodkurwe verskuif.",
          "Aanbod regs verskuif (toename) eerder as links (afname).",
          "Nuwe ewewigspunt nie etiketteer nie."
        ]
      },
      {
        question: "Verduidelik drie bemarkingskanale vir 'n groenteboer en stel een voordeel van elk.",
        steps: [
          "Kanaal 1 → voordeel.",
          "Kanaal 2 → voordeel.",
          "Kanaal 3 → voordeel."
        ],
        solution: "1. Varsproduktemark (bv. Johannesburgmark): boer verkoop aan agente. Voordeel: toegang tot groot, gesentraliseerde kopersbasis. 2. Direkte plaasstalletjie: boer verkoop direk aan verbruikers. Voordeel: maksimum prys — geen tussenmanne. 3. Kontrakboerdery (supermarkketting): boer stem in om vaste hoeveelheid teen vaste prys te lewer. Voordeel: gewaarborg inkomste.",
        commonErrors: [
          "Slegs een of twee kanale gee.",
          "Geen voordeel gee nie.",
          "Bemarkingskanaal met bemarktingstrategie verwar."
        ]
      },
      {
        question: "Bereken die netto plaas-inkomste: Bruto Inkomste = R800 000, Vaste koste = R200 000, Veranderlike koste = R350 000.",
        steps: [
          "Bereken totale koste.",
          "Bereken netto plaas-inkomste.",
          "Interpreteer die resultaat."
        ],
        solution: "Totale koste = R200 000 + R350 000 = R550 000. Netto plaas-inkomste = R800 000 − R550 000 = R250 000. Interpretasie: die boer het 'n wins van R250 000 gemaak.",
        commonErrors: [
          "Slegs veranderlike koste aftrek.",
          "Bruto inkomste met netto inkomste verwar.",
          "Geen interpretasie nie."
        ]
      }
    ]
  },

  // ===================== CONSUMER STUDIES (CON) =====================

  "CON-1": {
    workedExamplesEn: [
      {
        question: "Describe three rights a consumer has under the Consumer Protection Act (CPA) No 68 of 2008 and give an example of each.",
        steps: [
          "Right 1 → explain → example.",
          "Right 2 → explain → example.",
          "Right 3 → explain → example."
        ],
        solution: "1. Right to quality: goods must be of good quality, in good working order and free of defects for 6 months. Example: a fridge that stops working 2 months after purchase must be repaired, replaced or refunded. 2. Right to information: all information must be in plain language; prices must be displayed. Example: a cell phone contract must clearly state all fees and cancellation terms. 3. Right to equality: no unfair discrimination in access to goods. Example: a shop cannot refuse to serve a customer based on race.",
        commonErrors: [
          "Confusing the CPA with the National Credit Act.",
          "No example given for any right.",
          "Stating a right that does not exist in the CPA (e.g. 'right to free goods')."
        ]
      },
      {
        question: "A family's net monthly income is R18 000. Create a balanced monthly budget allocating income to the following needs: housing 30%, food 25%, transport 15%, clothing 10%, savings 10%, entertainment 10%.",
        steps: [
          "Calculate each category amount.",
          "Verify that the total equals 100%.",
          "Check the budget balances."
        ],
        solution: "Housing: 30% × R18 000 = R5 400. Food: 25% × R18 000 = R4 500. Transport: 15% × R18 000 = R2 700. Clothing: 10% × R18 000 = R1 800. Savings: 10% × R18 000 = R1 800. Entertainment: 10% × R18 000 = R1 800. Total = R18 000 ✓. Budget is balanced — income equals expenditure + savings.",
        commonErrors: [
          "Using gross income instead of net income.",
          "Arithmetic errors in the percentage calculations.",
          "Not verifying the budget balances to 100%."
        ]
      },
      {
        question: "Explain the dangers of buying on credit and describe two strategies to manage credit wisely.",
        steps: [
          "State two dangers of excessive credit use.",
          "Strategy 1 to manage credit.",
          "Strategy 2 to manage credit."
        ],
        solution: "Dangers: 1. Over-indebtedness: monthly repayments exceed income, leading to debt counselling or legal action. 2. High total cost: interest charges significantly inflate the real price paid — a R10 000 appliance can cost R15 000 over 24 months at 25% p.a. Strategies: 1. Borrow only what you can afford to repay — use the 10–15% rule (credit repayments should not exceed 10–15% of net income). 2. Pay more than the minimum monthly instalment to reduce total interest paid.",
        commonErrors: [
          "Only one danger stated.",
          "No strategies given.",
          "Confusing interest rate with the total cost of credit."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Beskryf drie regte wat 'n verbruiker het ingevolge die Verbruikersbeskerming Wet (VBW) en gee 'n voorbeeld van elk.",
        steps: [
          "Reg 1 → verduidelik → voorbeeld.",
          "Reg 2 → verduidelik → voorbeeld.",
          "Reg 3 → verduidelik → voorbeeld."
        ],
        solution: "1. Reg op gehalte: goedere moet van goeie gehalte wees vir 6 maande. Voorbeeld: 'n yskas wat 2 maande na aankoop ophou werk, moet herstel, vervang of terugbetaal word. 2. Reg op inligting: inligting in gewone taal; pryse vertoon. Voorbeeld: sellulêre kontrak moet alle fooie duidelik stel. 3. Reg op gelykheid: geen onbillike diskriminasie. Voorbeeld: winkel kan klant nie op grond van ras weier nie.",
        commonErrors: [
          "VBW met die Nasionale Kredietwet verwar.",
          "Geen voorbeeld gee nie.",
          "Reg stel wat nie in die VBW bestaan nie."
        ]
      },
      {
        question: "Gesinsmaandelikse netto inkomste is R18 000. Stel 'n gebalanseerde maandelikse begroting op: behuising 30%, kos 25%, vervoer 15%, kleding 10%, besparings 10%, ontspanning 10%.",
        steps: [
          "Bereken elke kategoriebedrag.",
          "Verifieer dat die totaal 100% is.",
          "Kontroleer of die begroting balanseer."
        ],
        solution: "Behuising: 30% × R18 000 = R5 400. Kos: R4 500. Vervoer: R2 700. Kleding: R1 800. Besparings: R1 800. Ontspanning: R1 800. Totaal = R18 000 ✓.",
        commonErrors: [
          "Bruto inkomste in plaas van netto gebruik.",
          "Rekenkundige foute.",
          "Nie verifieer dat die begroting balanseer nie."
        ]
      },
      {
        question: "Verduidelik die gevare van koop op krediet en beskryf twee strategieë om krediet verstandig te bestuur.",
        steps: [
          "Stel twee gevare van oormatige kredietgebruik.",
          "Strategie 1 om krediet te bestuur.",
          "Strategie 2 om krediet te bestuur."
        ],
        solution: "Gevare: 1. Oorskuldingsheid: maandelikse afbetalings oorskry inkomste. 2. Hoë totale koste: rentekoste verhoog die werklike prys aansienlik. Strategieë: 1. Leen slegs wat jy kan terugbetaal. 2. Betaal meer as die minimum maandelikse paaiement.",
        commonErrors: [
          "Slegs een gevaar stel.",
          "Geen strategieë gee nie.",
          "Rentekoers met totale kredietkoste verwar."
        ]
      }
    ]
  },

  "CON-2": {
    workedExamplesEn: [
      {
        question: "Classify the following nutrients and explain their main function in the body: carbohydrates, proteins, fats, vitamins, minerals, water.",
        steps: [
          "Classify into macronutrients and micronutrients.",
          "State the main function of each."
        ],
        solution: "Macronutrients (needed in large amounts): Carbohydrates — primary energy source (4 kJ/g); Proteins — growth, repair, enzyme synthesis (4 kJ/g); Fats — concentrated energy store, fat-soluble vitamin transport, cell membranes (37 kJ/g). Micronutrients (needed in small amounts): Vitamins — regulate body processes (e.g. Vitamin C for immunity, Vitamin D for calcium absorption); Minerals — structural (calcium in bones) and regulatory (iron in haemoglobin). Water — transport medium, thermoregulation, chemical reactions.",
        commonErrors: [
          "Classifying vitamins and minerals as macronutrients.",
          "Stating fat provides 4 kJ/g — it provides 37 kJ/g (more than double carbohydrates and protein).",
          "Not distinguishing between function and source."
        ]
      },
      {
        question: "Describe three food safety practices that a food handler must follow to prevent foodborne illness.",
        steps: [
          "Practice 1 → explain why.",
          "Practice 2 → explain why.",
          "Practice 3 → explain why."
        ],
        solution: "1. Personal hygiene: wash hands with soap and water for 20 seconds before handling food. Why: hands carry pathogens from surfaces to food. 2. Temperature control: keep cold foods below 5°C; cook hot foods above 74°C. Why: the danger zone (5–60°C) allows rapid bacterial multiplication. 3. Prevent cross-contamination: use separate cutting boards for raw meat and vegetables. Why: raw meat carries Salmonella and E.coli which can transfer to ready-to-eat foods.",
        commonErrors: [
          "No explanation of 'why' — practice alone earns partial credit.",
          "Only one or two practices.",
          "Confusing cross-contamination with food spoilage."
        ]
      },
      {
        question: "Read a food label and calculate the total energy (kJ) in 100g of a product with: carbohydrates 60g, protein 10g, fat 8g.",
        steps: [
          "Apply energy factors: carbohydrates = 17 kJ/g, protein = 17 kJ/g, fat = 37 kJ/g.",
          "Calculate energy from each macronutrient.",
          "Sum for total energy."
        ],
        solution: "Carbohydrates: 60 × 17 = 1 020 kJ. Protein: 10 × 17 = 170 kJ. Fat: 8 × 37 = 296 kJ. Total = 1 020 + 170 + 296 = 1 486 kJ per 100g.",
        commonErrors: [
          "Using 4 kJ/g for fat instead of 37 kJ/g.",
          "Using 9 kJ/g for fat (the kcal conversion, not kJ).",
          "Forgetting to sum all three components."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Klassifiseer die volgende voedingstowwe en verduidelik hul hooffunksie: koolhidrate, proteïene, vette, vitamiene, minerale, water.",
        steps: [
          "Klassifiseer in makrovoedingstowwe en mikrovoedingstowwe.",
          "Stel die hooffunksie van elk."
        ],
        solution: "Makrovoedingstowwe: Koolhidrate — primêre energiebron (17 kJ/g); Proteïene — groei, herstel (17 kJ/g); Vette — gekonsentreerde energieberging (37 kJ/g). Mikrovoedingstowwe: Vitamiene — reguleer liggaamsprosesse; Minerale — struktuur (kalsium) en regulering (yster). Water — vervoermedium, termoregulering.",
        commonErrors: [
          "Vitamiene en minerale as makrovoedingstowwe klassifiseer.",
          "Sê vet verskaf 4 kJ/g.",
          "Nie onderskei tussen funksie en bron nie."
        ]
      },
      {
        question: "Beskryf drie voedselveiligheidspraktyke wat 'n voedselhandelaar moet volg om voedselvergiftiging te voorkom.",
        steps: [
          "Praktyk 1 → verduidelik waarom.",
          "Praktyk 2 → verduidelik waarom.",
          "Praktyk 3 → verduidelik waarom."
        ],
        solution: "1. Persoonlike higiëne: was hande met seep vir 20 sekondes. Waarom: hande dra patogene oor. 2. Temperatuurbeheer: koue kos onder 5°C; warm kos bo 74°C. Waarom: gevaarsone (5–60°C) bevorder bakteriële vermeerdering. 3. Voorkom kruiskontaminasie: gebruik aparte snyborde vir rou vleis en groente. Waarom: rou vleis dra Salmonella en E.coli.",
        commonErrors: [
          "Geen 'waarom' verduideliking nie.",
          "Slegs een of twee praktyke.",
          "Kruiskontaminasie met voedselbederf verwar."
        ]
      },
      {
        question: "Bereken die totale energie (kJ) in 100g van 'n produk met: koolhidrate 60g, proteïen 10g, vet 8g.",
        steps: [
          "Pas energiefaktore toe: koolhidrate = 17 kJ/g, proteïen = 17 kJ/g, vet = 37 kJ/g.",
          "Bereken energie van elke makrovoedingstof.",
          "Som vir totale energie."
        ],
        solution: "Koolhidrate: 60 × 17 = 1 020 kJ. Proteïen: 10 × 17 = 170 kJ. Vet: 8 × 37 = 296 kJ. Totaal = 1 486 kJ per 100g.",
        commonErrors: [
          "4 kJ/g vir vet gebruik.",
          "9 kJ/g vir vet gebruik (kcal omskakeling).",
          "Vergeet om alle drie te someer."
        ]
      }
    ]
  },

  "CON-3": {
    workedExamplesEn: [
      {
        question: "Classify natural fibres and synthetic fibres, giving two examples and two properties of each.",
        steps: [
          "Define natural fibres → examples → properties.",
          "Define synthetic fibres → examples → properties."
        ],
        solution: "Natural fibres: derived from plants or animals. Examples: Cotton (plant), Wool (animal). Properties: absorbent, breathable, biodegradable, comfortable next to skin. Synthetic fibres: manufactured from petrochemicals. Examples: Polyester, Nylon. Properties: durable, quick-drying, wrinkle-resistant, pill-prone, non-biodegradable.",
        commonErrors: [
          "Classifying silk as synthetic — it is natural (from silkworm cocoons).",
          "Only one example per category.",
          "Properties are vague ('good quality') — must be specific textile properties."
        ]
      },
      {
        question: "Interpret the following care label symbols and explain how to care for the garment: 30°C wash, do not tumble dry, iron at low temperature, dry clean.",
        steps: [
          "Interpret each symbol.",
          "Give a practical care instruction for each."
        ],
        solution: "30°C wash symbol (tub with 30): wash in a machine at no more than 30°C — cold wash preserves colour and prevents shrinkage. Do not tumble dry (square with X): lay flat to dry or hang; the fabric cannot withstand tumble-dryer heat. Iron at low temperature (one dot): use the coolest iron setting; high heat will melt or scorch the fabric. Dry clean (circle): take to a professional dry cleaner; home washing would damage the fabric structure.",
        commonErrors: [
          "Confusing the tumble-dry symbol with the iron symbol.",
          "Ignoring the temperature restriction on the wash symbol.",
          "Not giving a practical instruction — symbol identification alone earns partial marks."
        ]
      },
      {
        question: "Explain three factors a consumer should consider when selecting clothing for a formal occasion.",
        steps: [
          "Factor 1 → explain.",
          "Factor 2 → explain.",
          "Factor 3 → explain."
        ],
        solution: "1. Occasion and dress code: formal occasions require conservative, well-fitted garments (suit, dress, shirt and tie) — casual clothing would be inappropriate. 2. Fabric suitability: choose fabrics that maintain shape and appearance throughout a long event (e.g. wool-blend for suits; polyester-viscose blends for dresses). 3. Fit and comfort: a garment must fit well — too tight restricts movement; too loose appears unprofessional. Proper fit conveys confidence.",
        commonErrors: [
          "Only one factor given.",
          "No explanation — listing factors without explaining them.",
          "Price as the primary factor — cost is secondary to appropriateness for formal selection."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Klassifiseer natuurlike vesels en sintetiese vesels, en gee twee voorbeelde en twee eienskappe van elk.",
        steps: [
          "Definieer natuurlike vesels → voorbeelde → eienskappe.",
          "Definieer sintetiese vesels → voorbeelde → eienskappe."
        ],
        solution: "Natuurlike vesels: afgelei van plante of diere. Voorbeelde: Katoen (plant), Wol (dier). Eienskappe: absorbeer vog, asemhaal, bioafbreekbaar. Sintetiese vesels: vervaardig van petrochemikalieë. Voorbeelde: Poliëster, Nylon. Eienskappe: duursaam, vinnig droog, kredietwrinkeling, nie-bioafbreekbaar.",
        commonErrors: [
          "Sy as sinteties klassifiseer.",
          "Slegs een voorbeeld per kategorie.",
          "Eienskappe vaag ('goeie gehalte')."
        ]
      },
      {
        question: "Interpreteer die volgende wasetiketsimbole: 30°C was, moenie tuimeldrog nie, stryk teen lae temperatuur, droogwas.",
        steps: [
          "Interpreteer elke simbool.",
          "Gee 'n praktiese versorgingsinstruksie vir elk."
        ],
        solution: "30°C (bad met 30): was in masjien teen nie meer as 30°C — koue was bewaar kleur. Moenie tuimeldrog (vierkant met X): plat uitlê of hang; weefsel kan nie warmte verdra nie. Stryk teen lae temperatuur (een kolletjie): gebruik koelste ysterstelling. Droogwas (sirkel): na professionele droogwasser.",
        commonErrors: [
          "Tuimeldrogsimbool met ysterbool verwar.",
          "Temperatuurbeperking op wassimbool ignoreer.",
          "Slegs simboolidentifikasie sonder praktiese instruksie."
        ]
      },
      {
        question: "Verduidelik drie faktore wat 'n verbruiker moet oorweeg by die keuse van kleding vir 'n formele geleentheid.",
        steps: [
          "Faktor 1 → verduidelik.",
          "Faktor 2 → verduidelik.",
          "Faktor 3 → verduidelik."
        ],
        solution: "1. Geleentheid en kledingkode: formele geleenthede vereis konserwatiewe, goedpassende kledingstukke. 2. Weefsel geskiktheid: kies weefsel wat vorm behou. 3. Passing en gemak: kledingstuk moet goed pas — te styf beperk beweging; te los lyk onprofessioneel.",
        commonErrors: [
          "Slegs een faktor gee.",
          "Geen verduideliking nie.",
          "Prys as die primêre faktor."
        ]
      }
    ]
  },

  "CON-4": {
    workedExamplesEn: [
      {
        question: "Apply the principles of interior design to a small living room: explain how colour, light and furniture placement can make the room appear larger.",
        steps: [
          "Colour strategy.",
          "Lighting strategy.",
          "Furniture placement strategy.",
          "Summarise the combined effect."
        ],
        solution: "Colour: use light, neutral colours (white, cream, pale grey) on walls and ceilings — light colours reflect more light and recede visually, creating a sense of space. Dark colours advance and make spaces feel smaller. Lighting: maximise natural light with sheer curtains; supplement with uplighting (floor lamps pointing up) rather than downlighting. Furniture placement: choose multi-functional, scale-appropriate furniture; keep pathways clear (at least 900mm wide); push furniture against walls to open floor space; use mirrors to reflect light and double the perceived depth.",
        commonErrors: [
          "Recommending dark accent colours for a small room — dark colours reduce perceived space.",
          "No mention of mirror use — mirrors are a classic small-room technique.",
          "Only one principle applied — the question asks for all three."
        ]
      },
      {
        question: "Explain three ergonomic principles that should be applied to the design of a kitchen workspace.",
        steps: [
          "Principle 1 → application in kitchen.",
          "Principle 2 → application in kitchen.",
          "Principle 3 → application in kitchen."
        ],
        solution: "1. Work triangle: refrigerator, sink and stove form a triangle — the sum of the three sides should be 3.6–6.7m to minimise movement. Ergonomic benefit: reduces fatigue from unnecessary steps. 2. Counter height: standard counter height 850–900mm matches average adult elbow height — reduces back and shoulder strain during food preparation. 3. Storage within reach zone: most-used items stored between hip and shoulder height (600–1500mm) — avoids awkward bending or reaching.",
        commonErrors: [
          "No specific measurements given — measurements demonstrate application depth.",
          "Only one principle.",
          "Principles listed without application to the kitchen specifically."
        ]
      },
      {
        question: "Describe two features of sustainable housing and explain how each reduces environmental impact.",
        steps: [
          "Feature 1 → environmental impact.",
          "Feature 2 → environmental impact."
        ],
        solution: "1. Solar panels (photovoltaic): convert sunlight to electricity. Environmental impact: reduces reliance on coal-fired grid power, lowering carbon emissions. In SA, a 3kW system offsets approximately 3–4 tonnes of CO₂ per year. 2. Rainwater harvesting: roof runoff collected in a tank for garden/toilet use. Environmental impact: reduces municipal water demand and pressure on water treatment infrastructure; reduces stormwater runoff which causes erosion.",
        commonErrors: [
          "Only one feature given.",
          "No explanation of environmental impact.",
          "Generic statements ('reduces pollution') without specifying the mechanism."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Pas die beginsels van binnehuis-ontwerp op 'n klein sitkamer toe: hoe kan kleur, lig en meubel-plasing die kamer groter laat lyk?",
        steps: [
          "Kleurstrategie.",
          "Ligstrategie.",
          "Meubel-plasingstrategie.",
          "Vat die gekombineerde effek saam."
        ],
        solution: "Kleur: gebruik lig, neutrale kleure op mure — lig kleure reflekteer meer lig en skep 'n gevoel van ruimte. Belysting: maksimeer natuurlike lig met deursigtige gordyne; gebruik oplaaibeligting. Meubel-plasing: kies meerdoelmatige meubels; hou paaie oop (ten minste 900mm wyd); gebruik spieëls.",
        commonErrors: [
          "Donker kleure vir 'n klein kamer aanbeveel.",
          "Geen vermelding van spieëlgebruik nie.",
          "Slegs een beginsel toegepas."
        ]
      },
      {
        question: "Verduidelik drie ergonomiese beginsels wat op 'n kombuiswerksruimte toegepas moet word.",
        steps: [
          "Beginsel 1 → toepassing in kombuis.",
          "Beginsel 2 → toepassing in kombuis.",
          "Beginsel 3 → toepassing in kombuis."
        ],
        solution: "1. Werkdriehoek: yskas, opwasbak en stoof vorm 'n driehoek (3.6–6.7m) — verminder fatigue. 2. Werkbladhoogte: 850–900mm pas gemiddelde volwasse elmbooghoogte — verminder rug- en skouerpyn. 3. Berging binne reikwydte: mees-gebruikte items tussen heup en skouer (600–1500mm).",
        commonErrors: [
          "Geen spesifieke metings gee nie.",
          "Slegs een beginsel.",
          "Beginsels sonder toepassing op kombuis lys."
        ]
      },
      {
        question: "Beskryf twee kenmerke van volhoubare behuising en verduidelik hoe elkeen die omgewingsimpak verminder.",
        steps: [
          "Kenmerk 1 → omgewingsimpak.",
          "Kenmerk 2 → omgewingsimpak."
        ],
        solution: "1. Sonpanele (fotovoltaïes): skakel sonlig na elektrisiteit om. Omgewingsimpak: verminder afhanklikheid van steenkool-kragstasies, verlaag koolstofuitstoot. 2. Reënwater-insameling: dakwater versamel vir tuin/toiletgebruik. Omgewingsimpak: verminder munisipale wateraanvraag en stormwaterafvloei.",
        commonErrors: [
          "Slegs een kenmerk gee.",
          "Geen omgewingsimpak verduidelik nie.",
          "Generiese stellings sonder meganisme."
        ]
      }
    ]
  },

  "CON-5": {
    workedExamplesEn: [
      {
        question: "Complete a feasibility study for a small cake-baking business from home.",
        steps: [
          "Market feasibility: is there demand?",
          "Technical feasibility: do you have the equipment and skills?",
          "Financial feasibility: will it be profitable?",
          "Conclusion: is it feasible?"
        ],
        solution: "Market feasibility: yes — local demand from offices, schools and private events; low competition in the neighbourhood; surveys show 70% of neighbours prefer home-baked goods. Technical feasibility: existing home oven handles 3 dozen cupcakes per batch; basic icing skills; health certificate required. Financial feasibility: cost per dozen = R45 (ingredients + packaging); selling price = R120; profit = R75/dozen. At 20 dozen/week = R1 500/week profit. Feasibility conclusion: viable on a small scale, with potential to grow if kitchen is upgraded.",
        commonErrors: [
          "Only completing one section of the feasibility study.",
          "No financial calculation.",
          "No conclusion drawn."
        ]
      },
      {
        question: "Explain the marketing mix (4Ps) and apply it to a student selling home-made sandwiches at school.",
        steps: [
          "Product: what is being sold?",
          "Price: how is it priced?",
          "Place: where is it sold?",
          "Promotion: how is it marketed?"
        ],
        solution: "Product: fresh, custom-order sandwiches (choice of fillings, whole-wheat or white bread). Price: R15 per sandwich — competitive with the school tuck shop (R20), priced using cost-plus (cost R8 + R7 profit). Place: sold during school break at a designated table outside the library. Promotion: WhatsApp group orders before school; handwritten menu posted on the school noticeboard.",
        commonErrors: [
          "Confusing 'Price' with 'cost' — price is what the customer pays.",
          "No promotion strategy given.",
          "Generic application not tied to the school sandwich context."
        ]
      },
      {
        question: "Calculate the break-even point for a student baking business: fixed costs = R800/month, selling price = R25/item, variable cost = R10/item.",
        steps: [
          "Calculate contribution margin per unit.",
          "Apply break-even formula.",
          "Interpret the result."
        ],
        solution: "Contribution margin = R25 − R10 = R15/item. Break-even = Fixed costs ÷ Contribution margin = R800 ÷ R15 = 53.33 ≈ 54 items. Interpretation: the student must sell 54 items per month before making any profit. Every item sold beyond 54 generates R15 profit.",
        commonErrors: [
          "Using selling price instead of contribution margin as the denominator.",
          "Not rounding up (53.3 items — must sell 54, not 53, to cover costs).",
          "No interpretation."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Voltooi 'n lewensvatbaarheidstudie vir 'n klein koekbakbesigheid van die huis.",
        steps: [
          "Marklewensvatbaarheid: is daar aanvraag?",
          "Tegniese lewensvatbaarheid: het jy toerusting en vaardighede?",
          "Finansiële lewensvatbaarheid: sal dit winsgewend wees?",
          "Gevolgtrekking: is dit lewensvatbaar?"
        ],
        solution: "Marklewensvatbaarheid: ja — plaaslike aanvraag van kantore en skole. Tegniese lewensvatbaarheid: huishoudelike oond hanteer 3 dosyne; gesondheidsertifikaat nodig. Finansiële lewensvatbaarheid: koste per dosyn = R45; verkoopprys = R120; wins = R75/dosyn. Teen 20 dosyne/week = R1 500/week. Gevolgtrekking: lewensvatbaar op klein skaal.",
        commonErrors: [
          "Slegs een afdeling van die studie voltooi.",
          "Geen finansiële berekening nie.",
          "Geen gevolgtrekking nie."
        ]
      },
      {
        question: "Verduidelik die bemarkingsmengsel (4P's) en pas dit toe op 'n leerder wat tuisgemaakte toebroodjies by skool verkoop.",
        steps: [
          "Produk: wat word verkoop?",
          "Prys: hoe is dit geprijsd?",
          "Plek: waar word dit verkoop?",
          "Bevordering: hoe word dit bemark?"
        ],
        solution: "Produk: vars, pasgemaakte toebroodjies. Prys: R15 per toebroodjie (koste R8 + R7 wins). Plek: verkoop tydens pouse by 'n aangewese tafel. Bevordering: WhatsApp-groepbestellings; handgeskrewe spyskaart op skoolbulletinbord.",
        commonErrors: [
          "'Prys' met 'koste' verwar.",
          "Geen bevorderingstrategie gee nie.",
          "Generiese toepassing nie aan die skoolkonteks gekoppel nie."
        ]
      },
      {
        question: "Bereken die gelykbreekpunt: vaste koste = R800/maand, verkoopprys = R25/item, veranderlike koste = R10/item.",
        steps: [
          "Bereken bydraemarge per eenheid.",
          "Pas gelykbreekformule toe.",
          "Interpreteer die resultaat."
        ],
        solution: "Bydraemarge = R25 − R10 = R15/item. Gelykbreek = R800 ÷ R15 = 53.3 ≈ 54 items. Interpretasie: die leerder moet 54 items per maand verkoop voor enige wins. Elke item bo 54 genereer R15 wins.",
        commonErrors: [
          "Verkoopprys in plaas van bydraemarge gebruik.",
          "Nie na bo afrond nie (54, nie 53).",
          "Geen interpretasie nie."
        ]
      }
    ]
  },

  // ===================== TOURISM (TOUR) =====================

  "TOUR-1": {
    workedExamplesEn: [
      {
        question: "Explain the interdependence between accommodation, transport and attractions in the tourism system.",
        steps: [
          "Define each sector briefly.",
          "Explain how accommodation depends on transport and attractions.",
          "Explain how attractions depend on the other two sectors.",
          "Give a South African example."
        ],
        solution: "Accommodation: where tourists sleep and eat. Transport: how tourists travel (airlines, car hire, buses). Attractions: what tourists come to see or do. Interdependence: a game reserve (attraction) relies on transport links (airports, roads) to bring visitors and on accommodation (lodges) to keep them overnight. Without accommodation, day visitors cannot extend their stay; without transport, guests cannot reach remote lodges. SA example: Kruger National Park — Nelspruit airport (transport) feeds guests to lodges (accommodation) inside the park (attraction). If flights are cancelled, lodge occupancy drops immediately.",
        commonErrors: [
          "Describing each sector in isolation without linking them.",
          "No South African example.",
          "Only two sectors discussed."
        ]
      },
      {
        question: "Classify the following accommodation types and state one advantage and disadvantage of each: 5-star hotel, backpacker hostel, self-catering apartment.",
        steps: [
          "Classify each type.",
          "State one advantage.",
          "State one disadvantage."
        ],
        solution: "5-star hotel: classified establishment, graded by Tourism Grading Council. Advantage: full services (concierge, restaurant, spa), consistent quality. Disadvantage: expensive. Backpacker hostel: budget accommodation. Advantage: affordable, social atmosphere. Disadvantage: shared facilities, less privacy. Self-catering apartment: non-serviced accommodation. Advantage: independence, kitchen facilities reduce food costs. Disadvantage: no daily housekeeping; guest prepares own meals.",
        commonErrors: [
          "No classification of accommodation type.",
          "Advantages and disadvantages mixed up.",
          "Only one type described."
        ]
      },
      {
        question: "Describe the role of a tour operator and a travel agent and explain how they differ.",
        steps: [
          "Define tour operator → role.",
          "Define travel agent → role.",
          "State the key difference."
        ],
        solution: "Tour operator: creates, packages and operates tour products (flights + accommodation + activities bundled into a package). They sell wholesale — primarily to travel agents. Examples: Thompsons Africa, Springbok Atlas. Travel agent: retail seller of travel products — books flights, accommodation and tour packages on behalf of clients. They do not create their own products; they sell on behalf of suppliers and operators. Key difference: operators design and operate products; agents sell what operators (and airlines, hotels) produce.",
        commonErrors: [
          "Saying a travel agent creates packages — they sell them.",
          "No mention of the wholesale vs retail distinction.",
          "No examples given."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die onderlinge afhanklikheid tussen akkommodasie, vervoer en attraksies in die toerismestelsel.",
        steps: [
          "Definieer elke sektor kortliks.",
          "Verduidelik hoe akkommodasie van vervoer en attraksies afhang.",
          "Verduidelik hoe attraksies van die ander twee afhang.",
          "Gee 'n Suid-Afrikaanse voorbeeld."
        ],
        solution: "Akkommodasie: waar toeriste slaap. Vervoer: hoe toeriste reis. Attraksies: wat toeriste kom sien. Onderlinge afhanklikheid: 'n wildtuin (attrakdie) staatmaak op vervoerskakels (lughawens, paaie) en akkommodasie (lodges). SA-voorbeeld: Kruger Nasionale Park — Nelspruit lughawe (vervoer) voed gaste na lodges (akkommodasie) in die park (attrakdie).",
        commonErrors: [
          "Elke sektor in isolasie beskryf.",
          "Geen SA-voorbeeld nie.",
          "Slegs twee sektore bespreek."
        ]
      },
      {
        question: "Klassifiseer die volgende akkommodasietipes en stel een voordeel en nadeel van elk: 5-ster hotel, rugsakhuis, selfversorgingsappartement.",
        steps: [
          "Klassifiseer elke tipe.",
          "Stel een voordeel.",
          "Stel een nadeel."
        ],
        solution: "5-ster hotel: gesertifiseerde instelling. Voordeel: volledige dienste. Nadeel: duur. Rugsaklojies: begrotingsakkommodasie. Voordeel: bekostigbaar. Nadeel: gedeelde fasiliteite. Selfversorgingsappartement: Voordeel: onafhanklikheid. Nadeel: geen daaglikse huishouding.",
        commonErrors: [
          "Geen klassifikasie nie.",
          "Voordele en nadele omruil.",
          "Slegs een tipe beskryf."
        ]
      },
      {
        question: "Beskryf die rol van 'n toeroperateur en 'n reisagent en verduidelik hoe hulle verskil.",
        steps: [
          "Definieer toeroperateur → rol.",
          "Definieer reisagent → rol.",
          "Stel die sleutelverskil."
        ],
        solution: "Toeroperateur: skep, verpak en bedryf toerprodukte (groothandel). Voorbeelde: Thompsons Africa. Reisagent: kleinhandelaar van reisprodukte — bespreek vlug, akkommodasie en pakkette namens kliënte. Sleutelverskil: operateurs ontwerp produkte; agente verkoop wat operateurs produseer.",
        commonErrors: [
          "Sê 'n reisagent skep pakkette.",
          "Geen groothandel vs kleinhandel onderskeid nie.",
          "Geen voorbeelde gee nie."
        ]
      }
    ]
  },

  "TOUR-2": {
    workedExamplesEn: [
      {
        question: "Explain the triple bottom line (TBL) framework for sustainable tourism and give one example of each pillar.",
        steps: [
          "Define sustainable tourism.",
          "Pillar 1: Economic sustainability → example.",
          "Pillar 2: Social/cultural sustainability → example.",
          "Pillar 3: Environmental sustainability → example."
        ],
        solution: "Sustainable tourism: tourism that meets current visitor needs without compromising future generations' ability to enjoy the same resources. Economic: local communities benefit economically. Example: a lodge employs and trains locals from the nearest village, keeping income in the community. Social/cultural: cultural heritage is preserved and respected. Example: a tour operator offers guided visits to a San rock art site with protocols to prevent touching the art. Environmental: natural resources are protected. Example: a marine tour company uses low-emission boats, limits group sizes and never feeds marine animals.",
        commonErrors: [
          "Only one or two pillars described.",
          "No examples.",
          "Confusing eco-tourism (a niche) with sustainable tourism (a broader principle)."
        ]
      },
      {
        question: "Describe three negative social impacts of mass tourism on a local community.",
        steps: [
          "Impact 1 → explain.",
          "Impact 2 → explain.",
          "Impact 3 → explain."
        ],
        solution: "1. Commodification of culture: local traditions (dances, crafts) become performances staged for tourists rather than genuine cultural expressions — authenticity is lost. 2. Increased cost of living: tourist demand inflates property and food prices, making the area unaffordable for residents. 3. Seasonal employment: tourism creates jobs, but many are seasonal — workers face unemployment in the off-season with no income security.",
        commonErrors: [
          "Stating only economic impacts — the question asks for social impacts.",
          "Only one or two impacts.",
          "No explanation — listing is insufficient."
        ]
      },
      {
        question: "Explain how a South African game lodge can reduce its carbon footprint.",
        steps: [
          "Energy source strategy.",
          "Water conservation strategy.",
          "Waste reduction strategy."
        ],
        solution: "Energy: install solar panels and solar water heaters to replace diesel generators — reduces CO₂ per kWh by ~90%. Water: grey water recycling system (shower water filtered and used for irrigation); low-flow taps and showers. Waste: composting organic waste from the kitchen; refuse separation for recycling; no single-use plastics (replaced by glass/stainless steel).",
        commonErrors: [
          "Only one strategy.",
          "No connection to carbon footprint specifically.",
          "Generic answers ('be more eco-friendly') without specific mechanisms."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die drievoudige onderpuntlyn (DOP) raamwerk vir volhoubare toerisme en gee een voorbeeld van elke pilaar.",
        steps: [
          "Definieer volhoubare toerisme.",
          "Pilaar 1: Ekonomiese volhoubaarheid → voorbeeld.",
          "Pilaar 2: Sosiale/kulturele volhoubaarheid → voorbeeld.",
          "Pilaar 3: Omgewingsvolhoubaarheid → voorbeeld."
        ],
        solution: "Volhoubare toerisme: toerisme wat huidige besoekerbehoeftes bevredig sonder om toekomstige generasies se vermoë te benadeel. Ekonomies: 'n lodge werk plaaslike inwoners in. Sosiaal: 'n toeroperateur bied begeleide besoeke aan 'n San-rotskunsgebied. Omgewings: 'n marinetuurgroep gebruik lae-uitstoot bote.",
        commonErrors: [
          "Slegs een of twee pilare beskryf.",
          "Geen voorbeelde nie.",
          "Ekoturisme met volhoubare toerisme verwar."
        ]
      },
      {
        question: "Beskryf drie negatiewe sosiale impakte van massa-toerisme op 'n plaaslike gemeenskap.",
        steps: [
          "Impak 1 → verduidelik.",
          "Impak 2 → verduidelik.",
          "Impak 3 → verduidelik."
        ],
        solution: "1. Verskansing van kultuur: plaaslike tradisies word vertonings vir toeriste — egtheid verlore. 2. Verhoogde lewenskoste: toeristaaanvraag verhoog eiendoms- en voedselprys. 3. Seisoenale indiensneming: baie werksgeleenthede is seisoenaal — werkers het geen inkomstesekerheid in die laagseisoen nie.",
        commonErrors: [
          "Slegs ekonomiese impakte stel.",
          "Slegs een of twee impakte.",
          "Geen verduideliking nie."
        ]
      },
      {
        question: "Verduidelik hoe 'n Suid-Afrikaanse wildreservaat-lodge sy koolstofvoetspoor kan verminder.",
        steps: [
          "Energiebron-strategie.",
          "Waterbewaringstrategie.",
          "Afvalverminderingstrategie."
        ],
        solution: "Energie: installeer sonpanele en sonderwaterverwarmer — verminder CO₂ per kWh met ~90%. Water: gryswater-herwinningstelsel; lae-vloei kraan. Afval: kompos organiewe afval; skeidingsherwinning; geen enkel-gebruik plastiek.",
        commonErrors: [
          "Slegs een strategie.",
          "Geen koppeling aan koolstofvoetspoor nie.",
          "Generiese antwoorde sonder spesifieke meganismes."
        ]
      }
    ]
  },

  "TOUR-3": {
    workedExamplesEn: [
      {
        question: "Apply the 4Ps of the marketing mix to a township food tour product in Cape Town.",
        steps: [
          "Product: describe the core product.",
          "Price: how is it priced and why?",
          "Place: distribution channels used.",
          "Promotion: how the product is marketed."
        ],
        solution: "Product: a 3-hour guided walk through a Cape Town township visiting four local eateries, tasting traditional foods, meeting chefs, hearing stories. Unique selling point: authentic cultural experience, small groups (max 12). Price: R450 per person — positioned as mid-range; justified by the guide, food tastings and storytelling value; group discounts for 10+. Place: sold via the tour's website, Airbnb Experiences, and local hotel concierges. Promotion: Instagram showcasing food imagery and guest testimonials; Google Ads targeting 'Cape Town food tours'; partnerships with the Cape Town Tourism board.",
        commonErrors: [
          "Describing only the product without the other 3Ps.",
          "No justification for the price point.",
          "Promotion limited to one channel."
        ]
      },
      {
        question: "Explain the concept of market segmentation in tourism and describe three ways a lodge could segment its market.",
        steps: [
          "Define market segmentation.",
          "Segment 1 → describe → marketing approach.",
          "Segment 2 → describe → marketing approach.",
          "Segment 3 → describe → marketing approach."
        ],
        solution: "Market segmentation: dividing a broad market into smaller groups with similar needs, so marketing efforts can be targeted. Segment 1 — Geographic: international vs domestic visitors. International: long-haul, higher spend, focus on Big Five safaris → advertise on international travel platforms. Segment 2 — Demographic: families vs couples. Families: need children's activities and interconnecting rooms → promote school holiday packages. Segment 3 — Psychographic: adventure vs luxury seekers. Adventure: hiking, night drives → promote on outdoor activity platforms. Luxury: spa, gourmet meals → promote in lifestyle magazines.",
        commonErrors: [
          "Only one segment given.",
          "No marketing approach for each segment.",
          "Treating all tourists as one homogeneous group."
        ]
      },
      {
        question: "Describe two advantages and two disadvantages of digital marketing for a small South African guest house.",
        steps: [
          "Advantage 1 → explain.",
          "Advantage 2 → explain.",
          "Disadvantage 1 → explain.",
          "Disadvantage 2 → explain."
        ],
        solution: "Advantage 1: Global reach at low cost — a well-optimised website and Booking.com listing reaches international travellers without the need for expensive print advertising. Advantage 2: Targeted advertising — Google Ads and Facebook Ads allow spend to be directed at specific demographics (e.g. 30–50-year-old UK travellers interested in wildlife). Disadvantage 1: Online review vulnerability — one negative TripAdvisor review can significantly harm bookings; small operators have fewer resources to respond. Disadvantage 2: Technical skills required — maintaining a website, responding to online enquiries 24/7, and optimising for search engines requires skills and time the owner may not have.",
        commonErrors: [
          "Only advantages or only disadvantages.",
          "No explanation — listing is insufficient.",
          "Confusing digital marketing with traditional marketing."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Pas die 4P's van die bemarkingsmengsel toe op 'n dorpskos-toer produk in Kaapstad.",
        steps: [
          "Produk: beskryf die kernproduk.",
          "Prys: hoe word dit geprijsd en waarom?",
          "Plek: verspreidingskanale.",
          "Bevordering: hoe die produk bemark word."
        ],
        solution: "Produk: 3-uur begeleide stap deur 'n Kaapstadse woonbuurt. Prys: R450 per persoon — middelklas. Plek: webwerf, Airbnb Experiences, hotelkonsiërge. Bevordering: Instagram, Google-advertensies, Kaapstadse Toerisme.",
        commonErrors: [
          "Slegs produk beskryf.",
          "Geen prysregverdiging nie.",
          "Bevordering tot een kanaal beperk."
        ]
      },
      {
        question: "Verduidelik marksegmentering in toerisme en beskryf drie maniere waarop 'n lodge sy mark kan segmenteer.",
        steps: [
          "Definieer marksegmentering.",
          "Segment 1 → beskryf → bemarktingsbenadering.",
          "Segment 2 → beskryf → bemarktingsbenadering.",
          "Segment 3 → beskryf → bemarktingsbenadering."
        ],
        solution: "Marksegmentering: verdeel 'n breë mark in kleiner groepe. Segment 1 — Geografies: internasionaal vs plaaslik. Internasionaal: adverteer op internasionale platforms. Segment 2 — Demografies: gesinne vs paartjies. Gesinne: bevorder vakansie-pakkette. Segment 3 — Psigografies: avontuur vs luuksheid. Avontuur: promoveer buitelugplatforms.",
        commonErrors: [
          "Slegs een segment gee.",
          "Geen bemarktingsbenadering vir elke segment nie.",
          "Alle toeriste as een homogene groep behandel."
        ]
      },
      {
        question: "Beskryf twee voordele en twee nadele van digitale bemarking vir 'n klein Suid-Afrikaanse gastehuis.",
        steps: [
          "Voordeel 1 → verduidelik.",
          "Voordeel 2 → verduidelik.",
          "Nadeel 1 → verduidelik.",
          "Nadeel 2 → verduidelik."
        ],
        solution: "Voordeel 1: Wêreldwye bereik teen lae koste. Voordeel 2: Geteikende advertering. Nadeel 1: Kwesbaar vir aanlyn resensies. Nadeel 2: Tegniese vaardighede benodig.",
        commonErrors: [
          "Slegs voordele of slegs nadele.",
          "Geen verduideliking nie.",
          "Digitale met tradisionele bemarking verwar."
        ]
      }
    ]
  },

  "TOUR-4": {
    workedExamplesEn: [
      {
        question: "Describe three of South Africa's UNESCO World Heritage Sites and explain why they qualify for this status.",
        steps: [
          "Site 1 → category → qualification.",
          "Site 2 → category → qualification.",
          "Site 3 → category → qualification."
        ],
        solution: "1. iSimangaliso Wetland Park (KZN): natural site — qualifies as an outstanding example of ecological and biological processes; home to 5 different ecosystems including the highest concentration of hippos and Nile crocodiles in SA. 2. Robben Island (Western Cape): cultural site — qualifies as a symbol of the triumph of democracy and freedom over oppression; where Nelson Mandela was imprisoned for 18 years. 3. Maloti-Drakensberg Park (KZN/Free State): mixed site — qualifies for its San rock art (over 35 000 individual images) and exceptional natural beauty; cross-border site shared with Lesotho.",
        commonErrors: [
          "Only one or two sites.",
          "No explanation of WHY they qualify — listing names alone is insufficient.",
          "Confusing the Cradle of Humankind (Gauteng) with iSimangaliso."
        ]
      },
      {
        question: "Match the following South African provinces to their key tourism attractions: Western Cape, KwaZulu-Natal, Mpumalanga.",
        steps: [
          "Western Cape → at least 3 attractions.",
          "KwaZulu-Natal → at least 3 attractions.",
          "Mpumalanga → at least 3 attractions."
        ],
        solution: "Western Cape: Table Mountain (one of New 7 Wonders of Nature), Cape Winelands (Stellenbosch, Franschhoek), Cape Point and the Cape of Good Hope, Boulders Beach penguins, the Garden Route. KwaZulu-Natal: iSimangaliso Wetland Park, uKhahlamba-Drakensberg, Golden Mile beaches (Durban), Valley of a Thousand Hills, Zulu cultural villages. Mpumalanga: Kruger National Park, Blyde River Canyon (3rd largest on Earth), Panorama Route (God's Window, Bourke's Luck Potholes).",
        commonErrors: [
          "Placing Kruger entirely in Limpopo — the southern part falls in Mpumalanga.",
          "Fewer than 3 attractions per province.",
          "Confusing provinces — e.g. placing the Drakensberg in Mpumalanga."
        ]
      },
      {
        question: "Explain how climate zones in South Africa affect tourism patterns (seasonality).",
        steps: [
          "Identify SA's main climate zones.",
          "Explain how each affects tourism seasonality.",
          "Give an example of a destination and its peak season."
        ],
        solution: "Main zones: Western Cape (Mediterranean — wet winters, dry summers); Highveld (summer rainfall, thunderstorms); KZN coast (subtropical — mild year-round). Seasonality: Western Cape peaks in summer (Dec–Feb) when it is warm and dry — Cape Town most crowded. KZN coast peaks in July school holidays (mild, dry winter). Kruger/Highveld safari peaks May–Sept (dry season — animals concentrate at waterholes and vegetation is sparse, improving sightings).",
        commonErrors: [
          "Stating SA has one uniform climate.",
          "No connection between climate and peak season.",
          "No examples given."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Beskryf drie van Suid-Afrika se UNESCO Wêrelderfenisgebiede en verduidelik waarom hulle vir hierdie status kwalifiseer.",
        steps: [
          "Werf 1 → kategorie → kwalifikasie.",
          "Werf 2 → kategorie → kwalifikasie.",
          "Werf 3 → kategorie → kwalifikasie."
        ],
        solution: "1. iSimangaliso Vleilandpark (KZN): natuurlik — 5 verskillende ekostelsels. 2. Robbeneiland (Wes-Kaap): kultureel — simbool van demokrasie; Mandela 18 jaar gevange. 3. Maloti-Drakensberge (KZN): gemeng — San-rotsuns (35 000+ beelde) en natuurskoon.",
        commonErrors: [
          "Slegs een of twee werwe.",
          "Geen verduideliking van kwalifikasie nie.",
          "Wieg van Mensdom met iSimangaliso verwar."
        ]
      },
      {
        question: "Koppel die volgende SA-provinsies aan hul sleuteltoerisme-attraksies: Wes-Kaap, KwaZulu-Natal, Mpumalanga.",
        steps: [
          "Wes-Kaap → ten minste 3 attraksies.",
          "KwaZulu-Natal → ten minste 3 attraksies.",
          "Mpumalanga → ten minste 3 attraksies."
        ],
        solution: "Wes-Kaap: Tafelberg, Wynlande, Kaappunt, Bouldersstrand-pikkewyne, Tuinroete. KwaZulu-Natal: iSimangaliso, uKhahlamba-Drakensberge, Goldenkus, Zoeloekultuurdriehoek. Mpumalanga: Kruger, Blyderiviercanyon, Panoramaroete.",
        commonErrors: [
          "Kruger slegs in Limpopo plaas.",
          "Minder as 3 attraksies per provinsie.",
          "Provinsies verwar."
        ]
      },
      {
        question: "Verduidelik hoe klimaatsones in SA toerismpatrone (seisoenaliteit) beïnvloed.",
        steps: [
          "Identifiseer SA se hoof klimaatsones.",
          "Verduidelik hoe elkeen seisoenaliteit beïnvloed.",
          "Gee 'n voorbeeld van 'n bestemming en sy hoogtydperk."
        ],
        solution: "Hoof sones: Wes-Kaap (Mediterreens — nat winters); Hoogveld (somerreënval); KZN-kus (subtropies). Seisoenaliteit: Wes-Kaap piek Desember–Februarie (warm en droog). KZN piek Julie (sagte, droë winter). Kruger piek Mei–September (droogseisoen — diere konsentreer).",
        commonErrors: [
          "Sê SA het een uniforme klimaat.",
          "Geen koppeling aan hoogtydperk nie.",
          "Geen voorbeelde nie."
        ]
      }
    ]
  },

  "TOUR-5": {
    workedExamplesEn: [
      {
        question: "Apply the GROW model to resolve a tourist complaint about a delayed game drive.",
        steps: [
          "Goal: what does the tourist want?",
          "Reality: what is the current situation?",
          "Options: what can be done?",
          "Way forward: agreed action."
        ],
        solution: "Goal: the tourist wants the missed experience remedied or compensated. Reality: the game drive was delayed 2 hours due to vehicle breakdown; the tourist missed the morning sightings. Options: 1. Offer a complimentary afternoon drive. 2. Partial refund. 3. Voucher for a future visit. Way forward: manager agrees to a complimentary sunset drive today plus a 20% voucher for a return visit — tourist satisfied, relationship preserved.",
        commonErrors: [
          "Only listening to the complaint without proposing options.",
          "Offering a refund as the first and only option.",
          "No agreed Way Forward — complaints must end with a concrete resolution."
        ]
      },
      {
        question: "Describe three communication skills that are essential for tourism front-line staff and explain why each matters.",
        steps: [
          "Skill 1 → why it matters.",
          "Skill 2 → why it matters.",
          "Skill 3 → why it matters."
        ],
        solution: "1. Active listening: giving full attention, nodding, not interrupting. Matters: tourists feel valued; misunderstandings are avoided; the correct need is identified before responding. 2. Clear verbal communication: using simple language, appropriate pace, no jargon. Matters: international visitors may not speak English fluently — complex language causes confusion and frustration. 3. Positive body language: open posture, eye contact, genuine smile. Matters: non-verbal signals account for 55–65% of communication impact; a closed posture (crossed arms) signals disinterest even if words are polite.",
        commonErrors: [
          "Only one skill given.",
          "No explanation of 'why it matters'.",
          "Listing generic virtues ('be friendly') rather than specific skills."
        ]
      },
      {
        question: "Explain three ways that cultural sensitivity can improve a tourist's experience.",
        steps: [
          "Way 1 → example.",
          "Way 2 → example.",
          "Way 3 → example."
        ],
        solution: "1. Religious dietary awareness: knowing that Muslim guests require halal food and Jewish guests require kosher options — a lodge that accommodates this avoids offence and ensures guests feel welcomed. 2. Greeting protocols: in some cultures direct eye contact is respectful; in others it is a challenge. A guide who understands this adjusts their greeting accordingly. 3. Photography etiquette: some indigenous communities prohibit photography of ceremonies or elders without permission — a culturally sensitive guide informs tourists and enforces these boundaries, preserving dignity and relationships.",
        commonErrors: [
          "Only one example.",
          "Generic statements ('respect other cultures') without specifics.",
          "No link to tourist experience improvement."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Pas die GROW-model toe om 'n toeristeklagte oor 'n vertraagde wildrit op te los.",
        steps: [
          "Doelwit: wat wil die toeris hê?",
          "Werklikheid: wat is die huidige situasie?",
          "Opsies: wat kan gedoen word?",
          "Pad vorentoe: ooreengekome aksie."
        ],
        solution: "Doelwit: toeris wil die gemiste ondervinding vergoed sien. Werklikheid: wildrit 2 uur vertraag weens voertuigbreuk. Opsies: gratis middag-rit; gedeeltelike terugbetaling; koepon vir toekomstige besoek. Pad vorentoe: bestuurder stem saam op gratis sonsondsrit plus 20% koepon — toeris tevrede.",
        commonErrors: [
          "Slegs na klagte luister sonder opsies voor te stel.",
          "Terugbetaling as eerste en enigste opsie aanbied.",
          "Geen ooreengekome pad vorentoe nie."
        ]
      },
      {
        question: "Beskryf drie kommunikasievaardighede wat noodsaaklik is vir toerisme-frontlinie personeel en verduidelik waarom elkeen saak maak.",
        steps: [
          "Vaardigheid 1 → waarom dit saak maak.",
          "Vaardigheid 2 → waarom dit saak maak.",
          "Vaardigheid 3 → waarom dit saak maak."
        ],
        solution: "1. Aktiewe luister: volle aandag gee, hoof knik, nie onderbreek. Saak: toeriste voel gewaardeer; misverstande vermy. 2. Duidelike mondelinge kommunikasie: eenvoudige taal, gepaste tempo. Saak: internasionale besoekers kan nie vlot Engels praat nie. 3. Positiewe lyftaal: oop houding, oogkontak. Saak: nie-verbale seine maak 55–65% van kommunikasie-impak uit.",
        commonErrors: [
          "Slegs een vaardigheid gee.",
          "Geen verduideliking van 'waarom dit saak maak' nie.",
          "Generiese deugde lys."
        ]
      },
      {
        question: "Verduidelik drie maniere waarop kulturele sensitiwiteit 'n toerist se ondervinding kan verbeter.",
        steps: [
          "Manier 1 → voorbeeld.",
          "Manier 2 → voorbeeld.",
          "Manier 3 → voorbeeld."
        ],
        solution: "1. Godsdienstige dieetbewustheid: halal/kosjer spyseniersversorging vermy aanstoot. 2. Begroetingsprotokolle: direkte oogkontak is in sommige kulture eerbiedigend; in ander 'n uitdaging. 3. Fotografieetiek: sommige inheemse gemeenskappe verbied fotografeer sonder toestemming — kultureel sensitiewe gids inform toeriste.",
        commonErrors: [
          "Slegs een voorbeeld.",
          "Generiese stellings sonder spesifikasies.",
          "Geen koppeling aan toeriste-ondervindingsverbetering nie."
        ]
      }
    ]
  },

  "TOUR-6": {
    workedExamplesEn: [
      {
        question: "A South African tourist travels to London. The exchange rate is R22.50 to £1. She has R18 000. Calculate how many British pounds she will receive.",
        steps: [
          "Identify the direct/indirect quote.",
          "Set up the calculation.",
          "Solve.",
          "Interpret."
        ],
        solution: "The rate R22.50/£1 means she pays R22.50 to get £1. Calculation: £ received = R18 000 ÷ R22.50 = £800. She will receive £800. Note: in practice, the bank or bureau de change adds a commission/spread — the tourist rate may be R23.00/£1 → £800 × (22.50/23.00) ≈ £782.61, so the practical amount is slightly less.",
        commonErrors: [
          "Multiplying (R18 000 × 22.50) instead of dividing — this gives the ZAR equivalent if you start with £.",
          "Forgetting to consider the bank's spread/commission.",
          "Not interpreting the result."
        ]
      },
      {
        question: "Explain three factors that cause exchange rates to fluctuate.",
        steps: [
          "Factor 1 → explain mechanism.",
          "Factor 2 → explain mechanism.",
          "Factor 3 → explain mechanism."
        ],
        solution: "1. Interest rates: higher SA interest rates attract foreign capital investment, increasing demand for ZAR → ZAR strengthens. Lower rates → capital outflows → ZAR weakens. 2. Inflation: higher SA inflation relative to trading partners reduces ZAR purchasing power → ZAR depreciates over time. 3. Political risk: political instability, policy uncertainty, or credit rating downgrades reduce investor confidence → capital flight → ZAR depreciates rapidly.",
        commonErrors: [
          "Only one factor.",
          "No mechanism — stating 'interest rates affect exchange rates' without explaining HOW.",
          "Confusing currency appreciation with depreciation."
        ]
      },
      {
        question: "A tour operator quotes a price of US$2 400 per person for a safari package. The exchange rate is R18.50/US$1. Calculate the ZAR price and the 15% VAT-inclusive price.",
        steps: [
          "Convert US$ to ZAR.",
          "Add 15% VAT.",
          "State the VAT-inclusive ZAR price."
        ],
        solution: "ZAR price = US$2 400 × R18.50 = R44 400. VAT at 15% = R44 400 × 0.15 = R6 660. VAT-inclusive price = R44 400 + R6 660 = R51 060. Note: tourism exports are generally zero-rated for VAT in SA — check if the VAT addition applies in context.",
        commonErrors: [
          "Dividing by the exchange rate instead of multiplying.",
          "Adding 15% by multiplying by 0.015 instead of 0.15.",
          "Not stating whether VAT is included or excluded in the final answer."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "'n Suid-Afrikaanse toeris reis na Londen. Wisselkoers is R22.50 tot £1. Sy het R18 000. Bereken hoeveel Britse pond sy sal ontvang.",
        steps: [
          "Identifiseer die direkte/indirekte aanhaling.",
          "Stel die berekening op.",
          "Los op.",
          "Interpreteer."
        ],
        solution: "R22.50/£1 beteken sy betaal R22.50 om £1 te kry. Berekening: £ ontvang = R18 000 ÷ R22.50 = £800. Prakties: bank se verspreiding verlaag dit effens.",
        commonErrors: [
          "Vermenigvuldig (R18 000 × 22.50) in plaas van deel.",
          "Vergeet van bank se verspreiding/kommissie.",
          "Geen interpretasie nie."
        ]
      },
      {
        question: "Verduidelik drie faktore wat wisselkoerse laat skommel.",
        steps: [
          "Faktor 1 → verduidelik meganisme.",
          "Faktor 2 → verduidelik meganisme.",
          "Faktor 3 → verduidelik meganisme."
        ],
        solution: "1. Rentekoerse: hoër SA-rentekoerse lok buitelandse kapitaal → aanvraag na ZAR styg → ZAR versterk. 2. Inflasie: hoër inflasie verlaag ZAR-koopkrag → ZAR waardedaling. 3. Politieke risiko: onstabiliteit verminder vertroue → kapitaluitvloei → ZAR verswak vinnig.",
        commonErrors: [
          "Slegs een faktor.",
          "Geen meganisme — bloot sê 'rentekoerse beïnvloed wisselkoerse'.",
          "Geldeenheidswaardestigning met -daling verwar."
        ]
      },
      {
        question: "Toeroperateur kwoteer US$2 400 per persoon. Wisselkoers is R18.50/US$1. Bereken die ZAR-prys en 15% BTW-inklusiewe prys.",
        steps: [
          "Skakel US$ na ZAR om.",
          "Voeg 15% BTW by.",
          "Stel BTW-inklusiewe ZAR-prys."
        ],
        solution: "ZAR-prys = US$2 400 × R18.50 = R44 400. BTW: R44 400 × 0.15 = R6 660. BTW-inklusief = R51 060.",
        commonErrors: [
          "Deel deur die wisselkoers in plaas van vermenigvuldig.",
          "15% bereken as × 0.015.",
          "Nie stel of BTW ingesluit of uitgesluit is nie."
        ]
      }
    ]
  },

  "TOUR-7": {
    workedExamplesEn: [
      {
        question: "On a 1:50 000 topographic map, a tourist measures 6 cm between two towns. Calculate the actual distance.",
        steps: [
          "State the scale (1:50 000 means 1 cm = 500 m).",
          "Multiply map distance by scale factor.",
          "Convert to kilometres."
        ],
        solution: "Scale 1:50 000: 1 cm on map = 50 000 cm = 500 m in reality. Actual distance = 6 cm × 500 m = 3 000 m = 3 km. The two towns are 3 km apart (as the crow flies — straight-line distance).",
        commonErrors: [
          "Using the inverse: dividing 6 by 50 000 gives 0.00012 (a tiny number — clearly wrong).",
          "Forgetting to convert cm to m (or m to km).",
          "Stating the answer is the road distance — the map measurement is straight-line distance only."
        ]
      },
      {
        question: "Use a compass bearing to navigate: from your camp (A), the waterfall (B) lies on a bearing of 045°. Describe what this means and draw the direction.",
        steps: [
          "Explain compass bearing convention.",
          "Describe a bearing of 045°.",
          "Explain how to walk this bearing.",
          "Draw the direction on a north-oriented diagram."
        ],
        solution: "Compass bearing: measured clockwise from true north (0°/360°). 045° is north-east (halfway between north and east). Walking: stand at camp (A) → hold compass flat → rotate until north needle aligns with north marker → read 045° on the dial → walk in the direction the bearing arrow points (NE). On diagram: north arrow pointing up; 045° line drawn at 45° clockwise from north, starting at point A and reaching point B.",
        commonErrors: [
          "Measuring bearing anticlockwise — bearings are always measured clockwise.",
          "Confusing magnetic north with true north — topographic maps usually show both.",
          "Not labelling the north arrow on the diagram."
        ]
      },
      {
        question: "Describe how to plan a road route between Cape Town and George using a road atlas.",
        steps: [
          "Locate starting and ending points on the index.",
          "Find both on the correct atlas pages.",
          "Identify the best route (national roads, distances).",
          "Calculate total distance and estimated travel time."
        ],
        solution: "Step 1: Use the atlas index to find Cape Town → page 12; George → page 34. Step 2: Identify the N2 as the primary route (Garden Route). Step 3: Cape Town → Swellendam → Mossel Bay → George via N2. Step 4: Total distance approximately 430 km; at 120 km/h average → ±3.5 hours driving time. Note: identify rest stops (Swellendam, Mossel Bay), fuel stations, and potential hazards (mountain passes — Outeniqua Pass).",
        commonErrors: [
          "Using the N1 (inland) instead of the N2 (coastal Garden Route).",
          "Not calculating travel time.",
          "No mention of rest stops or hazards — practical route planning includes these."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Op 'n 1:50 000 topografiese kaart meet 'n toeris 6 cm tussen twee dorpe. Bereken die werklike afstand.",
        steps: [
          "Stel die skaal (1:50 000 beteken 1 cm = 500 m).",
          "Vermenigvuldig kaartafstand met skaalfaktor.",
          "Skakel na kilometer om."
        ],
        solution: "Skaal 1:50 000: 1 cm op kaart = 500 m in werklikheid. Werklike afstand = 6 × 500 = 3 000 m = 3 km.",
        commonErrors: [
          "Omgekeerde gebruik: 6 deur 50 000 deel.",
          "Vergeet om cm na m om te skakel.",
          "Sê die antwoord is die padafstand — dit is reguitlyn afstand."
        ]
      },
      {
        question: "Gebruik 'n kompaspeiling: van jou kamp (A) lê die waterval (B) op 'n peiling van 045°. Beskryf wat dit beteken.",
        steps: [
          "Verduidelik kompaspeilingkonvensie.",
          "Beskryf 045°.",
          "Verduidelik hoe om hierdie peiling te loop.",
          "Teken die rigting op 'n noord-georiënteerde diagram."
        ],
        solution: "Kompaspeiling: met die klokswyser gemeet van die ware noorde (0°/360°). 045° is noordoos. Loop: staan by kamp (A) → hou kompas plat → draai totdat noordnaald lyn met noordmerk → lees 045° op die skaal → loop in die rigting van die peilingspyltjie (NO). Op diagram: noordpyl bo; 045° lyn 45° met klokswyser van noorde.",
        commonErrors: [
          "Peiling teen die klokswyser meet.",
          "Magnetiese noorde met ware noorde verwar.",
          "Die noordpyl op die diagram nie etiketteer nie."
        ]
      },
      {
        question: "Beskryf hoe om 'n padroete tussen Kaapstad en George deur 'n padatlas te beplan.",
        steps: [
          "Vind begin- en eindpunte in die register.",
          "Identifiseer die beste roete.",
          "Bereken totale afstand en geraamde reistyd."
        ],
        solution: "Stap 1: Gebruik die atlasregister. Stap 2: Identifiseer die N2 as primêre roete (Tuinroete). Stap 3: Kaapstad → Swellendam → Mosselbaai → George. Stap 4: ±430 km; teen 120 km/h ≈ 3.5 uur. Noem ruspunte en gevare (Outeniqua Pas).",
        commonErrors: [
          "N1 (binneland) in plaas van N2 (kus) gebruik.",
          "Reistyd nie bereken nie.",
          "Geen ruspunte of gevare nie."
        ]
      }
    ]
  },

  // ===================== VISUAL ARTS (ART) =====================

  "ART-1": {
    workedExamplesEn: [
      {
        question: "Analyse a print advertisement using the semiotic concepts of denotation and connotation.",
        steps: [
          "Describe the denotative meaning (what is literally shown).",
          "Analyse the connotative meaning (what it implies or symbolises).",
          "Identify the target audience.",
          "State the dominant ideology the ad reinforces."
        ],
        solution: "Ad: A perfume advertisement showing a white horse galloping on a beach at sunset, with a slender woman in a white dress. Denotative: a horse, a woman, a beach, a bottle of perfume. Connotative: the horse connotes wildness, freedom and power; the white connotes purity and femininity; the beach connotes escape and desire; the sunset connotes romance and luxury. Target audience: women aged 25–45, aspirational, mid-to-high income. Ideology: femininity is linked to nature, freedom and restraint — the ad sells an identity, not just a scent.",
        commonErrors: [
          "Confusing denotation (what is literally there) with connotation (what it symbolises).",
          "No target audience identified.",
          "No critical analysis of ideology — describing the ad is not the same as analysing it."
        ]
      },
      {
        question: "Explain the concept of 'the male gaze' (Mulvey) as applied to fashion photography.",
        steps: [
          "Define 'the male gaze'.",
          "Describe how it operates in fashion imagery.",
          "Give a specific example.",
          "State the critique."
        ],
        solution: "The male gaze (Laura Mulvey, 1975): the tendency of mainstream visual media to depict the world through the perspective and desires of a heterosexual male viewer, presenting women as objects of visual pleasure. In fashion photography: fragmented body shots (legs only, no face), submissive poses, impossibly thin and young models shot to emphasise sexuality rather than clothing function. Example: fragrance ads that show a woman's body draped across a male figure, positioned passively. Critique: this reduces women to decorative objects, normalises a narrow beauty ideal, and excludes non-male viewpoints.",
        commonErrors: [
          "Describing Mulvey without attributing the concept to her.",
          "No fashion-specific example.",
          "No critique — identifying is not the same as critically engaging."
        ]
      },
      {
        question: "Compare how Nike and Apple use visual branding to communicate different values.",
        steps: [
          "Identify Nike's core visual brand elements and values.",
          "Identify Apple's core visual brand elements and values.",
          "Compare the visual strategies.",
          "State what each brand wants the consumer to feel."
        ],
        solution: "Nike: Swoosh logo (movement, dynamism), bold red/black palette, imagery of athletes in motion, aspirational slogans ('Just Do It'). Values: achievement, determination, athletic identity. Apple: bitten apple logo (knowledge, simplicity), clean white/silver palette, minimal product photography on white backgrounds. Values: innovation, elegance, simplicity, exclusivity. Comparison: Nike sells aspiration through effort and sweat; Apple sells aspiration through effortless design. Nike's consumer is the active achiever; Apple's is the sophisticated creative.",
        commonErrors: [
          "Only one brand analysed.",
          "No comparison — describing each separately is not comparing.",
          "No statement of intended consumer feeling."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Ontleed 'n drukkersadvertensie deur die semotiese konsepte van denotasie en konnotasie te gebruik.",
        steps: [
          "Beskryf die denotatiewe betekenis (wat letterlik getoon word).",
          "Ontleed die konnotatiewe betekenis.",
          "Identifiseer die teikengehoor.",
          "Stel die dominante ideologie."
        ],
        solution: "Advertensie: parfuumadvertensie met wit perd op strand by sonsondergang, slanke vrou in wit rok. Denotatief: perd, vrou, strand, parfuumfles. Konnotatief: perd = wildheid, vryheid; wit = reinheid, vroulikheid; strand = ontsnapping; sonsondergang = romantiek. Teikengehoor: vroue 25–45. Ideologie: vroulikheid is aan natuur en vryheid gekoppel.",
        commonErrors: [
          "Denotasie (letterlik) met konnotasie (simbolies) verwar.",
          "Geen teikengehoor identifiseer nie.",
          "Geen kritiese ideologie-analise nie."
        ]
      },
      {
        question: "Verduidelik die konsep van 'die manlike blik' (Mulvey) soos toegepas op modephotografie.",
        steps: [
          "Definieer 'die manlike blik'.",
          "Beskryf hoe dit in modebeelde funksioneer.",
          "Gee 'n spesifieke voorbeeld.",
          "Stel die kritiek."
        ],
        solution: "Die manlike blik (Laura Mulvey, 1975): hoofstroom visuele media werp die wêreld deur die perspektief van 'n heteroseksuele manlike kyker. In modephotografie: gefragmenteerde liggaamskote, onderdanige posisies, onrealistiese liggaamstipes. Voorbeeld: parfuumadvertensie met vrou passief oor manlike figuur gedrapeer. Kritiek: reduseer vroue tot dekoratiewe objekte.",
        commonErrors: [
          "Mulvey nie toeskryf nie.",
          "Geen modespesifieke voorbeeld nie.",
          "Geen kritiek nie."
        ]
      },
      {
        question: "Vergelyk hoe Nike en Apple visuele handelsmerk gebruik om verskillende waardes te kommunikeer.",
        steps: [
          "Identifiseer Nike se kernvisuele handelsmerk en waardes.",
          "Identifiseer Apple se kernvisuele handelsmerk en waardes.",
          "Vergelyk die visuele strategieë.",
          "Stel wat elke handelsmerk die verbruiker wil laat voel."
        ],
        solution: "Nike: Swoosh-logo (beweging), vetgedrukte rooi/swart palet, atlete in beweging, 'Just Do It'. Waardes: prestasie, vastberadenheid. Apple: gebyte appellogo, skoon wit/silwer palet, minimale produkfotografie. Waardes: innovasie, elegansie. Vergelyking: Nike verkoop aspirasie deur inspanning; Apple deur moeitelose ontwerp.",
        commonErrors: [
          "Slegs een handelsmerk ontleed.",
          "Geen vergelyking — afsonderlike beskrywings is nie vergelyking nie.",
          "Geen stelsel van beoogde verbruikergevoel nie."
        ]
      }
    ]
  },

  "ART-2": {
    workedExamplesEn: [
      {
        question: "Compare Impressionism and Post-Impressionism, focusing on technique, subject matter and two key artists.",
        steps: [
          "Define Impressionism → technique → subject → artist.",
          "Define Post-Impressionism → technique → subject → artist.",
          "State the key shift between the movements."
        ],
        solution: "Impressionism (c.1860–1886, France): technique — short, visible brushstrokes capturing fleeting light effects; painted outdoors (en plein air); soft, broken colour. Subject: everyday modern life — cafes, ballet, gardens, rivers. Artists: Monet (Water Lilies, impression of light on water), Renoir (leisure and social life). Post-Impressionism (c.1886–1910): technique — retained Impressionist colour but added structure and emotional expression; each artist developed a unique, personal style. Subject: symbolic and emotional content, often internal/subjective experience. Artists: Van Gogh (swirling expressionist brushwork — Starry Night), Cézanne (geometric analysis of form — Mont Sainte-Victoire). Key shift: from objective observation of light to subjective, personal expression.",
        commonErrors: [
          "Confusing Impressionism with Expressionism (German, early 20th century).",
          "Only one artist mentioned.",
          "No statement of the key shift between movements."
        ]
      },
      {
        question: "Explain the key ideas of Dadaism and give an example of a Dada artwork, explaining what it challenges.",
        steps: [
          "Define Dadaism and its historical context.",
          "Name a key artist and artwork.",
          "Explain what the artwork challenges.",
          "State Dada's lasting influence."
        ],
        solution: "Dadaism (1916–1924, Zürich/New York/Berlin): an anti-art movement that rejected traditional aesthetics and reason — a response to the catastrophic irrationality of World War I. Key principle: art should be illogical, absurd and free of established rules. Key artwork: Marcel Duchamp's 'Fountain' (1917) — a commercially produced porcelain urinal placed on a pedestal and submitted to an art exhibition. Challenge: it challenges the definition of art ('can a mass-produced object be art?'), the role of the artist ('does art require technical skill?'), and the authority of the gallery to define taste. Lasting influence: conceptual art, performance art, and pop art all draw from Dada's readymade concept.",
        commonErrors: [
          "Describing Dadaism as 'silly' rather than understanding its political critique.",
          "No specific artwork named.",
          "No discussion of what the artwork challenges."
        ]
      },
      {
        question: "Explain how the socio-historical context of apartheid influenced South African art in the 1960s–1980s.",
        steps: [
          "Describe the apartheid context briefly.",
          "Name one white SA artist and how their work engaged with apartheid.",
          "Name one black SA artist and how their work engaged with apartheid.",
          "State the function of art under apartheid."
        ],
        solution: "Context: the apartheid regime (1948–1994) imposed racial segregation and suppressed black cultural expression; state censorship was pervasive. White artist: William Kentridge (b.1955) — created charcoal animations and drawings exploring white guilt, displacement and memory. Black artist: Gerard Sekoto (1913–1993) — painted black urban township life with warmth and dignity (Yellow Houses, A Street in Sophiatown), asserting humanity denied by apartheid. Later in exile in Paris. Function: art served as testimony and resistance — asserting humanity where the state sought dehumanisation.",
        commonErrors: [
          "Only one artist discussed.",
          "No connection to the apartheid context.",
          "No statement of the function of art in this context."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Vergelyk Impressionisme en Post-Impressionisme ten opsigte van tegniek, onderwerp en twee sleutelkunstenaars.",
        steps: [
          "Definieer Impressionisme → tegniek → onderwerp → kunstenaar.",
          "Definieer Post-Impressionisme → tegniek → onderwerp → kunstenaar.",
          "Stel die sleuteloorgang tussen die bewegings."
        ],
        solution: "Impressionisme (c.1860–1886, Frankryk): tegniek — kort, sigbare kwasstrepe wat vlugtige ligeffekte vang. Onderwerp: alledaagse moderne lewe. Kunstenaars: Monet, Renoir. Post-Impressionisme: tegniek — behou Impressionistiese kleur maar voeg struktuur en emosionele uitdrukking by. Kunstenaars: Van Gogh (draaiende kwaswerk), Cézanne (geometriese analise). Sleuteloorgang: van objektiewe waarneming na subjektiewe uitdrukking.",
        commonErrors: [
          "Impressionisme met Ekspressionisme verwar.",
          "Slegs een kunstenaar noem.",
          "Geen stelsel van die sleuteloorgang nie."
        ]
      },
      {
        question: "Verduidelik die sleutelgedagtes van Dadaïsme en gee 'n voorbeeld van 'n Dada-kunsverk.",
        steps: [
          "Definieer Dadaïsme en sy historiese konteks.",
          "Noem 'n sleutelkunstenaar en kunsverk.",
          "Verduidelik wat die kunsverk uitdaag.",
          "Stel Dada se blywende invloed."
        ],
        solution: "Dadaïsme (1916–1924): anti-kunsbeweging wat tradisionele estetika verwerp — reaksie op WOI se irrasionaliteit. Sleutelkunsverk: Marcel Duchamp se 'Fontein' (1917) — kommersieel vervaardigde pispot op 'n voetstuk. Uitdaging: wat kuns is, die rol van die kunstenaar, en die gesag van die galery. Blywende invloed: konsepsuele kuns, perfomancekuns, popkuns.",
        commonErrors: [
          "Dadaïsme as 'simpel' beskryf sonder politieke kritiek.",
          "Geen spesifieke kunsverk noem nie.",
          "Geen bespreking van wat die kunsverk uitdaag nie."
        ]
      },
      {
        question: "Verduidelik hoe die sosio-historiese konteks van apartheid SA kuns in die 1960s–1980s beïnvloed het.",
        steps: [
          "Beskryf die apartheid-konteks kortliks.",
          "Noem een wit SA-kunstenaar en hoe hul werk met apartheid omgegaan het.",
          "Noem een swart SA-kunstenaar.",
          "Stel die funksie van kuns onder apartheid."
        ],
        solution: "Konteks: apartheid (1948–1994) het rasse-skeiding opgelê en swart kulturele uitdrukking onderdruk. Wit kunstenaar: William Kentridge — skoolloutekenas en animasies wat skuld en geheue verken. Swart kunstenaar: Gerard Sekoto — skilder swart stedelike dorplewens met waardigheid (Geelpunt Huise). Funksie: kuns dien as getuienis en weerstand.",
        commonErrors: [
          "Slegs een kunstenaar bespreek.",
          "Geen koppeling aan apartheid-konteks nie.",
          "Geen stelsel van funksie van kuns nie."
        ]
      }
    ]
  },

  "ART-3": {
    workedExamplesEn: [
      {
        question: "Analyse how a named artist uses the element of colour to create mood and meaning in a specific artwork.",
        steps: [
          "Name the artwork and artist.",
          "Identify the dominant colour palette.",
          "Explain the psychological associations of those colours.",
          "Link colour to mood and meaning."
        ],
        solution: "Artwork: Edvard Munch, 'The Scream' (1893). Palette: blood-orange sky, deep red, swirling blue-greens. Psychological associations: red and orange → danger, anxiety, hysteria; the dark sinuous blues → oppression, suffocation. Mood: existential dread — the swirling colours mirror the central figure's emotional state, projecting inner turmoil onto the landscape (a technique called pathetic fallacy). Meaning: Munch described hearing 'an infinite scream passing through nature' — the colour embodies this synesthetic experience of anxiety made visible.",
        commonErrors: [
          "Listing colour names without their psychological associations.",
          "No link to mood.",
          "No artwork/artist specified — abstract answers without grounding score poorly."
        ]
      },
      {
        question: "Describe the printmaking process of linocut (relief printing) step by step.",
        steps: [
          "Prepare the lino block.",
          "Transfer the design.",
          "Cut the design.",
          "Ink the block.",
          "Print."
        ],
        solution: "Step 1: Prepare — sand the lino surface smooth; draw or trace the design (remember it will print in reverse). Step 2: Transfer — use carbon paper or draw directly onto the lino. Step 3: Cut — use linocut gouges to cut away areas that will remain white; what remains raised will print. Step 4: Ink — use a brayer (roller) to apply a thin, even layer of block printing ink over the raised surface. Step 5: Print — place paper on the inked block; apply even pressure by hand or with a baren; peel back to reveal the print.",
        commonErrors: [
          "Forgetting that the design prints in reverse — text must be cut backwards.",
          "Cutting INTO the design instead of the background.",
          "Applying ink too thickly — over-inking causes loss of fine detail."
        ]
      },
      {
        question: "Explain how the principle of balance is used in composition and give one example of symmetrical and one of asymmetrical balance.",
        steps: [
          "Define compositional balance.",
          "Define symmetrical balance → example.",
          "Define asymmetrical balance → example.",
          "State which creates more dynamic tension."
        ],
        solution: "Balance: the distribution of visual weight in a composition so that no single area overwhelms another. Symmetrical balance: the left and right (or top and bottom) of the composition mirror each other. Example: Da Vinci's 'The Last Supper' — Christ is centred, with 6 disciples on each side, creating a stable, monumental symmetry. Asymmetrical balance: different elements are arranged to achieve visual equilibrium without mirroring. Example: Hokusai's 'The Great Wave' — the massive wave (left) is balanced by the distant, small Mount Fuji (right); the small size of Fuji is offset by its colour contrast and symbolic weight. Dynamic tension: asymmetrical balance creates more visual energy and movement.",
        commonErrors: [
          "Confusing symmetrical with radial balance (circular symmetry).",
          "No examples given.",
          "No statement on which creates more dynamic tension."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Ontleed hoe 'n genoemde kunstenaar die element van kleur gebruik om stemming en betekenis in 'n spesifieke kunsverk te skep.",
        steps: [
          "Noem die kunsverk en kunstenaar.",
          "Identifiseer die dominante kleurpalet.",
          "Verduidelik die sielkundige assosiasies.",
          "Koppel kleur aan stemming en betekenis."
        ],
        solution: "Kunsverk: Edvard Munch, 'Die Skreeu' (1893). Palet: bloedoranje lug, diep rooi, draaiende blou-groen. Sielkundige assosiasies: rooi en oranje → gevaar, angs; donker sinuose blou → verdrukking. Stemming: eksistensieële verskrikking. Betekenis: Munch het 'n oneindige skreeu deur die natuur beskryf — kleur beliggaam hierdie angservaring.",
        commonErrors: [
          "Kleurname sonder sielkundige assosiasies lys.",
          "Geen koppeling aan stemming nie.",
          "Geen kunsverk/kunstenaar gespesifiseer nie."
        ]
      },
      {
        question: "Beskryf die drukproses van linosnit (reliëfdruk) stap vir stap.",
        steps: [
          "Berei die linoblok voor.",
          "Oordra die ontwerp.",
          "Sny die ontwerp.",
          "Ink die blok.",
          "Druk."
        ],
        solution: "Stap 1: Berei — skuur die linooppervlak glad; teken of spoor die ontwerp na (druk in omgekeerde). Stap 2: Oordra — gebruik koolstofpapier. Stap 3: Sny — gebruik linobeitel om wit areas te verwyder; wat verhef bly, druk. Stap 4: Ink — gebruik brayer vir dun, egalige inklaag. Stap 5: Druk — plaas papier op ingeinkte blok; druk gelyk.",
        commonErrors: [
          "Vergeet dat die ontwerp in omgekeerde druk.",
          "IN die ontwerp in plaas van die agtergrond sny.",
          "Te dik ink — fyn detail gaan verlore."
        ]
      },
      {
        question: "Verduidelik hoe die beginsel van balans in komposisie gebruik word en gee een voorbeeld van simmetriese en een van asimmetriese balans.",
        steps: [
          "Definieer komposisionele balans.",
          "Definieer simmetriese balans → voorbeeld.",
          "Definieer asimmetriese balans → voorbeeld.",
          "Stel watter dinamiese spanning skep."
        ],
        solution: "Balans: verspreiding van visuele gewig sodat geen enkele area die ander oorweldig nie. Simmetries: links en regs weerspieël mekaar. Voorbeeld: Da Vinci se 'Die Laaste Avondmaal' — Christus gesentreer, 6 dissipels aan elke kant. Asimmetries: verskillende elemente bereik visuele ewewig sonder spieëling. Voorbeeld: Hokusai se 'Die Groot Golf' — massiewe golf (links) gebalanseer deur klein Fuji (regs). Dinamiese spanning: asimmetriese balans skep meer visuele energie.",
        commonErrors: [
          "Simmetriese met radiale balans verwar.",
          "Geen voorbeelde nie.",
          "Geen stelsel oor dinamiese spanning nie."
        ]
      }
    ]
  },

  "ART-4": {
    workedExamplesEn: [
      {
        question: "Explain the concept of 'institutional critique' in contemporary art and give a named example.",
        steps: [
          "Define institutional critique.",
          "Give a named artwork and artist.",
          "Explain what institution is being critiqued.",
          "State the method of critique."
        ],
        solution: "Institutional critique: an art practice that examines, challenges or exposes the norms, power structures and assumptions of art institutions (museums, galleries, auction houses). Example: Hans Haacke, 'Shapolsky et al. Manhattan Real Estate Holdings, a Real-Time Social System, as of May 1, 1971' — a documentary display of 142 photographs and data tables exposing a slumlord's property empire in Harlem. Institution critiqued: the Guggenheim Museum cancelled the exhibition — revealing that the museum was itself connected to the property developer. Method: using the art institution's own space and language (the exhibition format) to expose its complicity with corrupt power structures.",
        commonErrors: [
          "Confusing institutional critique with social activism broadly.",
          "No specific artwork named.",
          "No explanation of the method of critique."
        ]
      },
      {
        question: "Discuss how digital technology has changed the way contemporary artists create and distribute work.",
        steps: [
          "Creation: how digital tools change making.",
          "Distribution: how digital platforms change who sees the work.",
          "Monetisation: new economic models.",
          "Example of a contemporary digital artist."
        ],
        solution: "Creation: digital tools (Photoshop, Cinema 4D, AI image generators) allow artists to create images, sculptures (via 3D printing), and interactive installations without traditional materials. Distribution: social media (Instagram, TikTok) allows artists to build global audiences directly — bypassing galleries. A single viral post can reach millions. Monetisation: NFTs (non-fungible tokens) allow digital art to be sold as unique, authenticated works on blockchain platforms — Beeple sold 'Everydays: The First 5000 Days' for US$69 million in 2021. Contemporary artist: Refik Anadol — uses AI and data to create large-scale immersive data paintings on building facades.",
        commonErrors: [
          "Only discussing creation without distribution.",
          "No example of a contemporary digital artist.",
          "Treating NFTs as purely positive without acknowledging environmental and fraud concerns."
        ]
      },
      {
        question: "What is an 'installation' artwork? Give an example and explain how it differs from a traditional painting or sculpture.",
        steps: [
          "Define installation art.",
          "Give a named example.",
          "Explain how it differs from painting/sculpture.",
          "State the role of the viewer/space."
        ],
        solution: "Installation art: a three-dimensional, site-specific work that transforms the experience of a space — often engaging multiple senses and requiring the viewer to move through it. Example: Yayoi Kusama's 'Infinity Mirror Rooms' — mirrored chambers filled with hanging LED lights, creating the illusion of infinite space; the viewer enters the room and becomes part of the work. Differences: painting is 2D, viewed from one position; sculpture is 3D but self-contained; installation art is defined by its relationship to a specific space and the viewer's movement through it — the space and time of viewing are part of the artwork. Role of viewer: active, embodied participant rather than passive observer.",
        commonErrors: [
          "Describing any large artwork as an installation.",
          "No named example.",
          "No explanation of how it differs from traditional media."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die konsep van 'institusionele kritiek' in kontemporêre kuns en gee 'n genoemde voorbeeld.",
        steps: [
          "Definieer institusionele kritiek.",
          "Gee 'n genoemde kunsverk en kunstenaar.",
          "Verduidelik watter instelling gekritiseer word.",
          "Stel die metode van kritiek."
        ],
        solution: "Institusionele kritiek: kunspraktyk wat die norme, magsstrukture en aannames van kunsinstellings ondersoek. Voorbeeld: Hans Haacke se dokumentêre vertoning wat 'n behuisingseienaar se eiendomsryk in Harlem blootstel. Guggenheim kanselleer die uitstalling — onthullend dat die museum self met die eiendomsontwikkelaar verbonde was. Metode: gebruik die instelling se eie ruimte om sy medepligtigheid bloot te stel.",
        commonErrors: [
          "Institusionele kritiek met sosiale aktivisme verwar.",
          "Geen spesifieke kunsverk noem nie.",
          "Geen verduideliking van die metode nie."
        ]
      },
      {
        question: "Bespreek hoe digitale tegnologie die manier waarop kontemporêre kunstenaars werk skep en versprei het verander.",
        steps: [
          "Skepping: hoe digitale gereedskap skep verander.",
          "Verspreiding: hoe digitale platforms toegang verander.",
          "Verdienste: nuwe ekonomiese modelle.",
          "Voorbeeld van 'n kontemporêre digitale kunstenaar."
        ],
        solution: "Skepping: Photoshop, Cinema 4D, KI beeldgenerators laat kunstenaars sonder tradisionele materiale skep. Verspreiding: sosiale media laat kunstenaars globale gehore direk bereik. Verdienste: NFT's laat digitale kuns as unieke werke verkoop word — Beeple het 'Everydays' vir US$69 miljoen verkoop. Kunstenaar: Refik Anadol — gebruik KI en data vir grootskaalse immersiwe datawerke.",
        commonErrors: [
          "Slegs skepping bespreek.",
          "Geen voorbeeld nie.",
          "NFT's as suiwer positief behandel."
        ]
      },
      {
        question: "Wat is 'n 'installasie'-kunsverk? Gee 'n voorbeeld en verduidelik hoe dit van 'n tradisionele skildery of skulptuur verskil.",
        steps: [
          "Definieer installasiekuns.",
          "Gee 'n genoemde voorbeeld.",
          "Verduidelik hoe dit van skildery/skulptuur verskil.",
          "Stel die rol van die kyker/ruimte."
        ],
        solution: "Installasiekuns: driedimensionele, terreinspesifieke werk wat die ondervinding van 'n ruimte transformeer. Voorbeeld: Yayoi Kusama se 'Infinity Mirror Rooms' — spieëlkamers met LED-ligte; kyker betree die kamer. Verskille: skildery is 2D; skulptuur is op homself; installasie word gedefinieer deur verhouding met spesifieke ruimte en kyker se beweging. Rol van kyker: aktiewe deelnemer.",
        commonErrors: [
          "Enige groot kunsverk as installasie beskryf.",
          "Geen genoemde voorbeeld nie.",
          "Geen verduideliking van verskil met tradisionele media nie."
        ]
      }
    ]
  },

  "ART-5": {
    workedExamplesEn: [
      {
        question: "Analyse a work by J.H. Pierneef, discussing its visual style and its representation of the South African landscape.",
        steps: [
          "Name the artwork.",
          "Describe the visual style (formal elements and compositional characteristics).",
          "Analyse what aspects of the SA landscape are represented.",
          "Critically evaluate what is included and excluded."
        ],
        solution: "Artwork: 'Bushveld Trees' (c.1930s). Visual style: stylised, simplified flat colour planes; strong silhouettes against clear skies; geometric reduction of natural forms; almost no human presence; harmonious, ordered compositions that suggest timelessness and grandeur. Representation: the South African highveld and bushveld is presented as majestic, empty, and pristine — a sublime natural Eden. Critical evaluation: the work excludes black South African people and farmworkers who lived and worked in this landscape — the emptiness is an ideological choice reinforcing a white colonial pastoral ideal. The landscapes were partly commissioned for railway stations, suggesting they were designed to attract white settlers and tourists.",
        commonErrors: [
          "Describing the artwork without critical analysis.",
          "No mention of what is excluded from the representation.",
          "Not connecting the art to its historical and ideological context."
        ]
      },
      {
        question: "Discuss how William Kentridge uses charcoal drawing and animation to explore themes of memory and post-apartheid guilt.",
        steps: [
          "Describe Kentridge's technique.",
          "Explain why he uses erasure and transformation.",
          "Identify the themes explored.",
          "Name a specific work."
        ],
        solution: "Technique: Kentridge draws in charcoal on paper, photographs the image, erases and redraws, photographs again — compiling frames into animated films. The erasure leaves visible traces. Why erasure: the trace of the erased mark is central to the work — memory is not clean; it persists even when we try to forget. Historical events cannot be simply wiped away — their marks remain. Themes: white liberal guilt under apartheid; complicity and responsibility; memory and history; industrialisation and exploitation. Specific work: 'Monument' (1990) — animation depicting Soho Eckstein (a wealthy white industrialist) presiding over workers, exploring power and exploitation. Critical: Kentridge acknowledges that his work is made from the privileged position of a white South African male — the work is partly self-critical.",
        commonErrors: [
          "Describing the animation without the conceptual significance of erasure.",
          "No specific work named.",
          "No connection to post-apartheid guilt as a theme."
        ]
      },
      {
        question: "Explain how Gerard Sekoto's paintings assert the dignity and humanity of black urban South Africans under apartheid.",
        steps: [
          "Describe Sekoto's style.",
          "Identify the subjects he paints.",
          "Explain how his treatment of subjects asserts dignity.",
          "State the significance of his work in the context of apartheid."
        ],
        solution: "Style: warm, earthy palette; Expressionist influence; figures painted with rounded, humanising forms; soft light that creates intimacy. Subjects: everyday township life — families cooking outside, children playing, women at work; the vibrancy of black urban communities in Sophiatown and Johannesburg. Dignity assertion: Sekoto paints black people as fully human, with warmth, community, and joy — directly contradicting apartheid ideology that dehumanised them. Significance: Sekoto left SA in 1947, settling in Paris, partly because his art and presence were unwelcome in a racially segregated art world. His paintings are important historical documents of black life before forced removals destroyed places like Sophiatown.",
        commonErrors: [
          "Describing the style without connecting it to the ideological context.",
          "Saying Sekoto was a political activist — he was primarily a painter whose subject matter was inherently political.",
          "No mention of Sophiatown or the significance of the communities he depicted."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Ontleed 'n werk van J.H. Pierneef, en bespreek sy visuele styl en verteenwoordiging van die SA landskap.",
        steps: [
          "Noem die kunsverk.",
          "Beskryf die visuele styl.",
          "Ontleed watter aspekte van die SA-landskap uitgedruk word.",
          "Evalueer krities wat ingesluit en uitgesluit is."
        ],
        solution: "Kunsveld: 'Bosveldborne' (c.1930s). Visuele styl: gestiliseerde, vereenvoudigde plat kleurplane; sterk silhoeëtte teen skoon lug; geometriese vereenvoudiging; byna geen menslike teenwoordigheid; harmonieuse komposisies. Verteenwoordiging: SA hoogveld aangebied as majestieuse, leë, ongerepte Eden. Kritiese evaluasie: swart SA-mense en plaaswerkers is uitgesluit — die leegheid is 'n ideologiese keuse.",
        commonErrors: [
          "Kunsverk beskryf sonder kritiese analise.",
          "Geen vermelding van wat uitgesluit is nie.",
          "Nie die kuns aan historiese konteks koppel nie."
        ]
      },
      {
        question: "Bespreek hoe William Kentridge houtskooltekening en animasie gebruik om temas van geheue en post-apartheidskuld te verken.",
        steps: [
          "Beskryf Kentridge se tegniek.",
          "Verduidelik waarom hy uitwissing en transformasie gebruik.",
          "Identifiseer die verkende temas.",
          "Noem 'n spesifieke werk."
        ],
        solution: "Tegniek: Kentridge teken in houtskool, fotografeer, wis uit en herteken — frames saamgestel tot geanimeerde films. Die uitwissing laat sigbare spore. Waarom: die spoor van die uitgewiste merk is sentraal — geheue is nie skoon nie. Temas: wit liberale skuld; medepligtigheid; geheue; industrialisasie. Spesifieke werk: 'Monument' (1990) — animasie wat Soho Eckstein (ryk wit nyweraar) uitdruk.",
        commonErrors: [
          "Animasie beskryf sonder die konseptuele betekenis van uitwissing.",
          "Geen spesifieke werk noem nie.",
          "Geen koppeling aan post-apartheidskuld nie."
        ]
      },
      {
        question: "Verduidelik hoe Gerard Sekoto se skilderye die waardigheid en menslikheid van swart stedelike SA's onder apartheid bevestig.",
        steps: [
          "Beskryf Sekoto se styl.",
          "Identifiseer die onderwerpe wat hy skilder.",
          "Verduidelik hoe sy behandeling van onderwerpe waardigheid bevestig.",
          "Stel die belang van sy werk in apartheidskonteks."
        ],
        solution: "Styl: warm, erdelike palet; Ekspressionistiese invloed; figure met afgeronde, vermenslikte vorms. Onderwerpe: alledaagse dorpslewe — gesinne wat kos kook, kinders wat speel; die lewendigheid van swart stedelike gemeenskappe in Sophiatown. Waardigheidsbevestiging: Sekoto schilder swart mense as ten volle menslik — dit weerspreek apartheidsideologie. Belang: Sekoto het SA in 1947 verlaat, gedeeltelik omdat sy kuns en teenwoordigheid in 'n rasse-gesegregeerde kunswereld onwelkom was.",
        commonErrors: [
          "Styl beskryf sonder ideologiese konteks te koppel.",
          "Sê Sekoto was 'n politieke aktivis.",
          "Geen vermelding van Sophiatown nie."
        ]
      }
    ]
  },

  // ===================== TECHNICAL MATHEMATICS (TMATH) =====================

  "TMATH-1": {
    workedExamplesEn: [
      {
        question: "The 3rd term of an arithmetic sequence is 17 and the 7th term is 37. Find the general term Tₙ.",
        steps: [
          "Write two equations using Tₙ = a + (n-1)d.",
          "Subtract to find d.",
          "Back-substitute to find a.",
          "Write the general term."
        ],
        solution: "T₃ = a + 2d = 17 ... (1). T₇ = a + 6d = 37 ... (2). (2)-(1): 4d = 20 → d = 5. Sub d=5 into (1): a + 10 = 17 → a = 7. Tₙ = 7 + (n-1)(5) = 5n + 2.",
        commonErrors: [
          "Using T₃ = a + 3d instead of a + 2d (off-by-one error).",
          "Not subtracting equations — solving inefficiently.",
          "Not simplifying Tₙ to standard form."
        ]
      },
      {
        question: "Find the sum to 10 terms of the geometric series: 3 + 6 + 12 + …",
        steps: [
          "Identify a and r.",
          "Apply Sₙ = a(rⁿ - 1)/(r - 1).",
          "Calculate."
        ],
        solution: "a = 3, r = 6/3 = 2. S₁₀ = 3(2¹⁰ - 1)/(2 - 1) = 3(1024 - 1)/1 = 3 × 1023 = 3 069.",
        commonErrors: [
          "Using Sₙ = a(1 - rⁿ)/(1 - r) with r > 1 and getting a negative numerator — both formulas are correct; choose the sign that gives a positive denominator.",
          "Calculating 2¹⁰ incorrectly (1024, not 512).",
          "Forgetting to multiply by a."
        ]
      },
      {
        question: "A geometric sequence has T₁ = 8 and r = 1/2. Find the sum to infinity.",
        steps: [
          "Verify |r| < 1.",
          "Apply S∞ = a/(1-r).",
          "Calculate."
        ],
        solution: "|r| = 1/2 < 1, so S∞ exists. S∞ = 8/(1 - 1/2) = 8/(1/2) = 8 × 2 = 16.",
        commonErrors: [
          "Attempting S∞ without verifying |r| < 1.",
          "Using S∞ = a(1-r) instead of a/(1-r).",
          "Arithmetic error in dividing by a fraction."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Die 3de term van 'n rekkundige ry is 17 en die 7de term is 37. Vind die algemene term Tₙ.",
        steps: [
          "Skryf twee vergelykings deur Tₙ = a + (n-1)d.",
          "Trek af om d te vind.",
          "Terug-vervang om a te vind.",
          "Skryf die algemene term."
        ],
        solution: "T₃ = a + 2d = 17 (1). T₇ = a + 6d = 37 (2). (2)-(1): 4d = 20 → d = 5. a + 10 = 17 → a = 7. Tₙ = 5n + 2.",
        commonErrors: [
          "T₃ = a + 3d gebruik.",
          "Vergelykings nie aftrek nie.",
          "Tₙ nie vereenvoudig nie."
        ]
      },
      {
        question: "Vind die som tot 10 terme van die meetkundige reeks: 3 + 6 + 12 + …",
        steps: [
          "Identifiseer a en r.",
          "Pas Sₙ = a(rⁿ - 1)/(r - 1) toe.",
          "Bereken."
        ],
        solution: "a = 3, r = 2. S₁₀ = 3(2¹⁰ - 1)/(2 - 1) = 3 × 1023 = 3 069.",
        commonErrors: [
          "Sₙ = a(1 - rⁿ)/(1 - r) gebruik met r > 1.",
          "2¹⁰ verkeerd bereken (1024, nie 512).",
          "Vergeet om met a te vermenigvuldig."
        ]
      },
      {
        question: "Meetkundige ry het T₁ = 8 en r = 1/2. Vind die som tot oneindigheid.",
        steps: [
          "Verifieer |r| < 1.",
          "Pas S∞ = a/(1-r) toe.",
          "Bereken."
        ],
        solution: "|r| = 1/2 < 1 → S∞ bestaan. S∞ = 8/(1 - 1/2) = 8/(1/2) = 16.",
        commonErrors: [
          "S∞ probeer sonder om |r| < 1 te verifieer.",
          "S∞ = a(1-r) gebruik.",
          "Rekenkundige fout met breuk as deler."
        ]
      }
    ]
  },

  "TMATH-2": {
    workedExamplesEn: [
      {
        question: "Sketch the graph of f(x) = -2(x - 3)² + 8, showing the vertex, axis of symmetry, x-intercepts and y-intercept.",
        steps: [
          "Identify the vertex from the vertex form.",
          "State the axis of symmetry.",
          "Find x-intercepts (set f(x) = 0).",
          "Find y-intercept (x = 0).",
          "Note the direction of opening (a < 0 → opens downward)."
        ],
        solution: "Vertex: (3, 8). Axis of symmetry: x = 3. Opening: downward (a = -2 < 0). X-intercepts: -2(x-3)² + 8 = 0 → (x-3)² = 4 → x-3 = ±2 → x = 5 or x = 1. Y-intercept: f(0) = -2(-3)² + 8 = -18 + 8 = -10 → (0, -10). Sketch: downward parabola with vertex at (3,8), cutting x-axis at x=1 and x=5, y-intercept at (0,-10).",
        commonErrors: [
          "Vertex read as (-3, 8) instead of (3, 8) — sign inside bracket reverses.",
          "Opening direction: positive a means upward, negative means downward.",
          "Y-intercept calculation error: substituting x=0 correctly is crucial."
        ]
      },
      {
        question: "For the function g(x) = 3/(x - 2) + 1, state the domain, range, asymptotes and draw a sketch.",
        steps: [
          "Identify the vertical asymptote.",
          "Identify the horizontal asymptote.",
          "State domain and range.",
          "Find x- and y-intercepts if they exist."
        ],
        solution: "Vertical asymptote: x = 2 (denominator = 0). Horizontal asymptote: y = 1 (shift of 1 from y = 0). Domain: x ∈ ℝ, x ≠ 2. Range: y ∈ ℝ, y ≠ 1. X-intercept: g(x) = 0 → 3/(x-2) + 1 = 0 → 3/(x-2) = -1 → x-2 = -3 → x = -1. Y-intercept: g(0) = 3/(0-2) + 1 = -3/2 + 1 = -1/2.",
        commonErrors: [
          "Stating the vertical asymptote as x = -2 (not accounting for the shift).",
          "Domain stated as x ≠ 0 instead of x ≠ 2.",
          "Confusing vertical and horizontal asymptotes."
        ]
      },
      {
        question: "If f(x) = 2^x, describe the effect of: (a) a = 2^(x+3), (b) b = 2^x - 5.",
        steps: [
          "Identify transformation type for each.",
          "Describe the direction and magnitude of each shift."
        ],
        solution: "(a) a = 2^(x+3): horizontal shift 3 units LEFT (the +3 inside the exponent shifts left). Graph of 2^x moves left by 3 — same shape, y-intercept changes from 1 to 2³ = 8. (b) b = 2^x - 5: vertical shift 5 units DOWN. Horizontal asymptote moves from y = 0 to y = -5. Y-intercept changes from 1 to 1 - 5 = -4.",
        commonErrors: [
          "Confusing horizontal direction: 2^(x+3) shifts LEFT, not right.",
          "Forgetting that a vertical shift also moves the asymptote.",
          "Not updating the y-intercept for each transformation."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Skets die grafiek van f(x) = -2(x - 3)² + 8 met die hoogtepunt, simmetrie-as, x-snypunte en y-snypunt.",
        steps: [
          "Identifiseer die hoogtepunt van die hoogtepuntvorm.",
          "Stel die simmetrie-as.",
          "Vind x-snypunte (stel f(x) = 0).",
          "Vind y-snypunt (x = 0).",
          "Let op openingsrigting (a < 0 → oopwaarts)."
        ],
        solution: "Hoogtepunt: (3, 8). Simmetrie-as: x = 3. Oopwaarts: afwaarts (a = -2 < 0). X-snypunte: x = 5 of x = 1. Y-snypunt: f(0) = -18 + 8 = -10 → (0, -10). Skets: afwaartse paraboloïde.",
        commonErrors: [
          "Hoogtepunt as (-3, 8) lees.",
          "Openingsrigting verkeerd.",
          "Y-snypunt berekeningsfout."
        ]
      },
      {
        question: "Vir g(x) = 3/(x - 2) + 1, stel die domein, bereik, asimptote en teken 'n skets.",
        steps: [
          "Identifiseer die vertikale asimptoot.",
          "Identifiseer die horisontale asimptoot.",
          "Stel domein en bereik.",
          "Vind x- en y-snypunte."
        ],
        solution: "Vertikale asimptoot: x = 2. Horisontale asimptoot: y = 1. Domein: x ≠ 2. Bereik: y ≠ 1. X-snypunt: x = -1. Y-snypunt: g(0) = -1/2.",
        commonErrors: [
          "Vertikale asimptoot as x = -2 stel.",
          "Domein as x ≠ 0 stel.",
          "Vertikale en horisontale asimptote verwar."
        ]
      },
      {
        question: "As f(x) = 2^x, beskryf die effek van: (a) a = 2^(x+3), (b) b = 2^x - 5.",
        steps: [
          "Identifiseer die transformasietipe vir elk.",
          "Beskryf die rigting en grootte van elke verskuiwing."
        ],
        solution: "(a) a = 2^(x+3): horisontale verskuiwing 3 eenhede LINKS. Y-snypunt verander na 2³ = 8. (b) b = 2^x - 5: vertikale verskuiwing 5 eenhede af. Asimptoot na y = -5. Y-snypunt = -4.",
        commonErrors: [
          "Horisontale rigting verwar: 2^(x+3) verskuif LINKS, nie regs.",
          "Vergeet dat asimptoot ook met vertikale verskuiwing beweeg.",
          "Y-snypunt nie opgedateer vir elke transformasie nie."
        ]
      }
    ]
  },

  "TMATH-3": {
    workedExamplesEn: [
      {
        question: "Calculate the future value of R25 000 invested for 5 years at 8% per annum compounded quarterly.",
        steps: [
          "Identify A, P, r, n, t.",
          "Apply the compound interest formula: A = P(1 + r/n)^(nt).",
          "Calculate."
        ],
        solution: "P = R25 000, r = 0.08 (8% per annum), n = 4 (quarterly), t = 5. A = 25 000(1 + 0.08/4)^(4×5) = 25 000(1.02)^20. (1.02)^20 = 1.4859... A = 25 000 × 1.4859 = R37 148.59.",
        commonErrors: [
          "Using r = 8 instead of r = 0.08.",
          "Using n = 5 (years) instead of n = 4 (compounding periods per year).",
          "Confusing compound interest formula with simple interest formula A = P(1 + rt)."
        ]
      },
      {
        question: "A car is bought on hire purchase for R180 000, with a 20% deposit and the balance financed at 12% p.a. simple interest over 4 years. Calculate the monthly payment.",
        steps: [
          "Calculate the deposit and the loan amount.",
          "Calculate the total interest (simple interest).",
          "Calculate the total repayment amount.",
          "Divide by the total number of months."
        ],
        solution: "Deposit: 20% × R180 000 = R36 000. Loan: R180 000 - R36 000 = R144 000. Interest: I = P × r × t = R144 000 × 0.12 × 4 = R69 120. Total repayment: R144 000 + R69 120 = R213 120. Monthly payment: R213 120 ÷ 48 months = R4 440.",
        commonErrors: [
          "Forgetting to subtract the deposit before calculating interest.",
          "Using compound interest instead of simple interest for hire purchase.",
          "Dividing by years (4) instead of months (48)."
        ]
      },
      {
        question: "How much must be invested now at 9% p.a. compound interest to have R100 000 in 8 years? (Present Value)",
        steps: [
          "Identify A, r, n, t.",
          "Rearrange to find P: P = A/(1 + r)^t.",
          "Calculate."
        ],
        solution: "A = R100 000, r = 0.09, t = 8 (annual compounding, n = 1). P = 100 000/(1.09)^8 = 100 000/1.99256... = R50 187.ruck P ≈ R50 187.",
        commonErrors: [
          "Using the future value formula and solving for P without rearranging first.",
          "(1.09)^8 calculated incorrectly — use a calculator step by step.",
          "Not interpreting the answer as a present value (money invested today)."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Bereken die toekomstige waarde van R25 000 belê vir 5 jaar teen 8% per jaar saamgestel kwartaalliks.",
        steps: [
          "Identifiseer A, P, r, n, t.",
          "Pas A = P(1 + r/n)^(nt) toe.",
          "Bereken."
        ],
        solution: "P = R25 000, r = 0.08, n = 4, t = 5. A = 25 000(1.02)^20 = 25 000 × 1.4859 = R37 148.59.",
        commonErrors: [
          "r = 8 gebruik in plaas van 0.08.",
          "n = 5 (jare) in plaas van n = 4 gebruik.",
          "Saamgestelde renteformule met enkelvoudige renteformule verwar."
        ]
      },
      {
        question: "Motor gekoop op huurkoop vir R180 000, 20% deposito, balans teen 12% p.j. enkelvoudige rente oor 4 jaar. Bereken die maandelikse paaiement.",
        steps: [
          "Bereken deposito en leningsbedrag.",
          "Bereken totale rente (enkelvoudig).",
          "Bereken totale terugbetaling.",
          "Deel deur totale maande."
        ],
        solution: "Deposito: R36 000. Lening: R144 000. Rente: R144 000 × 0.12 × 4 = R69 120. Totaal: R213 120. Maandelikse: R4 440.",
        commonErrors: [
          "Vergeet om deposito af te trek voor renteberekening.",
          "Saamgestelde rente vir huurkoop gebruik.",
          "Deur jare (4) in plaas van maande (48) deel."
        ]
      },
      {
        question: "Hoeveel moet nou belê word teen 9% p.j. saamgestelde rente om in 8 jaar R100 000 te hê? (Huidige Waarde)",
        steps: [
          "Identifiseer A, r, n, t.",
          "Herrangskik om P te vind: P = A/(1 + r)^t.",
          "Bereken."
        ],
        solution: "A = R100 000, r = 0.09, t = 8. P = 100 000/(1.09)^8 = 100 000/1.99256 ≈ R50 187.",
        commonErrors: [
          "Toekomstige waarde formule gebruik sonder om vir P te herrangskik.",
          "(1.09)^8 verkeerd bereken.",
          "Antwoord nie as huidige waarde interpreteer nie."
        ]
      }
    ]
  },

  "TMATH-4": {
    workedExamplesEn: [
      {
        question: "A ladder of 6 m leans against a wall at 65° to the ground. Find the height reached on the wall.",
        steps: [
          "Draw and label the right triangle.",
          "Identify the known angle and hypotenuse.",
          "Choose the correct trig ratio.",
          "Calculate."
        ],
        solution: "Triangle: angle at ground = 65°, hypotenuse (ladder) = 6 m, opposite = height on wall. sin(65°) = opposite/hypotenuse = h/6. h = 6 × sin(65°) = 6 × 0.9063 = 5.44 m.",
        commonErrors: [
          "Using cos instead of sin — cos gives the base, not the height.",
          "Dividing 6 by sin(65°) instead of multiplying.",
          "Calculator in degree mode confusion — ensure degrees, not radians."
        ]
      },
      {
        question: "Prove the identity: sin²θ + cos²θ = 1 and use it to simplify: (1 - cos²θ)/sinθ.",
        steps: [
          "State the Pythagorean identity.",
          "Rearrange to express 1 - cos²θ.",
          "Substitute and simplify the expression."
        ],
        solution: "Identity: sin²θ + cos²θ = 1 (Pythagorean theorem on unit circle). Rearrange: 1 - cos²θ = sin²θ. Simplification: (1 - cos²θ)/sinθ = sin²θ/sinθ = sinθ (for sinθ ≠ 0).",
        commonErrors: [
          "Dividing sin²θ by sinθ and getting sin²θ/sinθ = sinθ — this is correct, but students often cancel incorrectly.",
          "Not stating the restriction sinθ ≠ 0.",
          "Confusing sin²θ with sin(2θ)."
        ]
      },
      {
        question: "Using the sine rule, find side b in triangle ABC where A = 40°, B = 75°, a = 12 cm.",
        steps: [
          "State the sine rule.",
          "Find angle C.",
          "Apply the sine rule to find b.",
          "Calculate."
        ],
        solution: "Sine rule: a/sinA = b/sinB = c/sinC. Given: A = 40°, B = 75°, a = 12. b/sinB = a/sinA → b/sin75° = 12/sin40°. b = 12 × sin75°/sin40° = 12 × 0.9659/0.6428 = 18.04 cm.",
        commonErrors: [
          "Using the cosine rule when the sine rule is sufficient (given two angles and a side).",
          "Setting up the ratio as sinB/b = sinA/a (inverted) — either form is correct, but consistency is essential.",
          "Calculator errors — use sin values to 4 decimal places."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Leer van 6 m leun teen 'n muur teen 65° tot die grond. Vind die hoogte bereik op die muur.",
        steps: [
          "Teken en etiketteer die reghoekige driehoek.",
          "Identifiseer die bekende hoek en skuinssy.",
          "Kies die korrekte driehoeksverhouding.",
          "Bereken."
        ],
        solution: "sin(65°) = h/6. h = 6 × sin(65°) = 6 × 0.9063 = 5.44 m.",
        commonErrors: [
          "Cos in plaas van sin gebruik.",
          "6 deur sin(65°) deel in plaas van vermenigvuldig.",
          "Sakrekenaar in radiale modus."
        ]
      },
      {
        question: "Bewys die identiteit: sin²θ + cos²θ = 1 en vereenvoudig: (1 - cos²θ)/sinθ.",
        steps: [
          "Stel die Pythagoreaanse identiteit.",
          "Herrangskik om 1 - cos²θ uit te druk.",
          "Vervang en vereenvoudig."
        ],
        solution: "Identiteit: sin²θ + cos²θ = 1. Herrangskik: 1 - cos²θ = sin²θ. Vereenvoudiging: sin²θ/sinθ = sinθ (vir sinθ ≠ 0).",
        commonErrors: [
          "sin²θ/sinθ onkorrekt kanselleer.",
          "Beperking sinθ ≠ 0 nie stel nie.",
          "sin²θ met sin(2θ) verwar."
        ]
      },
      {
        question: "Deur die sinusreël te gebruik, vind sy b in driehoek ABC waar A = 40°, B = 75°, a = 12 cm.",
        steps: [
          "Stel die sinusreël.",
          "Vind hoek C.",
          "Pas sinusreël toe om b te vind.",
          "Bereken."
        ],
        solution: "b/sin75° = 12/sin40°. b = 12 × sin75°/sin40° = 18.04 cm.",
        commonErrors: [
          "Kosinusreël gebruik wanneer sinusreël voldoende is.",
          "Verhouding omgekeerd opstel.",
          "Sakrekenaarfoute."
        ]
      }
    ]
  },

  "TMATH-5": {
    workedExamplesEn: [
      {
        question: "Prove that the opposite angles of a cyclic quadrilateral are supplementary.",
        steps: [
          "Draw a cyclic quadrilateral ABCD with centre O.",
          "Let ∠ABC = β and ∠ADC = δ.",
          "Express the reflex ∠AOC and ∠AOC in terms of β.",
          "Show β + δ = 180°."
        ],
        solution: "ABCD is a cyclic quadrilateral. ∠AOC (major arc) = 2β (inscribed angle theorem: central angle = 2 × inscribed angle on minor arc). Reflex ∠AOC = 360° - 2β. Also, reflex ∠AOC = 2δ (inscribed angle on major arc). So 2δ = 360° - 2β → δ = 180° - β → β + δ = 180°. ∴ Opposite angles are supplementary. ∎",
        commonErrors: [
          "Not distinguishing between the major and minor arc when applying the inscribed angle theorem.",
          "Stating the result without proof steps.",
          "Confusing the theorem with the exterior angle theorem."
        ]
      },
      {
        question: "In the diagram, O is the centre of the circle. ∠BOC = 110°. Calculate ∠BAC.",
        steps: [
          "Identify the relationship between the central angle and inscribed angle.",
          "State the theorem.",
          "Apply and calculate."
        ],
        solution: "Theorem: inscribed angle = half the central angle subtended by the same arc. ∠BOC = 110° (central angle). ∠BAC = ½ × 110° = 55°.",
        commonErrors: [
          "Stating ∠BAC = 110° (confusing central with inscribed angle).",
          "Using the wrong theorem (e.g. tangent-chord instead of inscribed angle).",
          "Not verifying both angles subtend the same arc."
        ]
      },
      {
        question: "Prove: the angle between a tangent to a circle and a chord drawn from the point of tangency equals the inscribed angle on the opposite side (tangent-chord angle).",
        steps: [
          "Draw the tangent PT and chord PQ.",
          "Draw diameter PR.",
          "Show ∠TPQ = ∠PRQ.",
          "Complete the proof."
        ],
        solution: "Let tangent at P be PT. Draw chord PQ. Draw diameter PR. ∠RPT = 90° (tangent ⊥ radius). ∠QPR = 90° - ∠QPT (complementary). In semicircle: ∠PQR = 90° (angle in semicircle). So ∠PRQ = 90° - ∠QPR = 90° - (90° - ∠QPT) = ∠QPT. ∴ ∠TPQ = ∠PRQ. ∎ (tangent-chord = inscribed angle in alternate segment).",
        commonErrors: [
          "Not drawing the diameter to create the right angle.",
          "Skipping steps in the proof — each step must be justified.",
          "Confusing the tangent-chord theorem with the cyclic quadrilateral theorem."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Bewys dat die teenoorstaande hoeke van 'n koorsgeleding supplementêr is.",
        steps: [
          "Teken koordgeleding ABCD met middelpunt O.",
          "Laat ∠ABC = β en ∠ADC = δ.",
          "Druk reflekshoek ∠AOC in terme van β uit.",
          "Wys β + δ = 180°."
        ],
        solution: "∠AOC (kleiner boog) = 2β. Refleks ∠AOC = 360° - 2β = 2δ. Dus: δ = 180° - β → β + δ = 180°. ∴ Teenoorstaande hoeke is supplementêr. ∎",
        commonErrors: [
          "Nie onderskei tussen groot en klein boog nie.",
          "Resultaat stel sonder bewysstappe.",
          "Hierdie stelling met die buitenste hoek stelling verwar."
        ]
      },
      {
        question: "O is die middelpunt van die sirkel. ∠BOC = 110°. Bereken ∠BAC.",
        steps: [
          "Identifiseer verwantskap tussen middelpunthoek en ingeskrewe hoek.",
          "Stel die stelling.",
          "Pas toe en bereken."
        ],
        solution: "∠BAC = ½ × 110° = 55°.",
        commonErrors: [
          "∠BAC = 110° sê.",
          "Verkeerde stelling gebruik.",
          "Nie verifieer dat beide hoeke dieselfde boog onderspeel nie."
        ]
      },
      {
        question: "Bewys: die hoek tussen 'n raaklyn en 'n koord = die ingeskrewe hoek aan die teenoorgestelde kant.",
        steps: [
          "Teken raaklyn PT en koord PQ.",
          "Teken deursnee PR.",
          "Wys ∠TPQ = ∠PRQ.",
          "Voltooi die bewys."
        ],
        solution: "∠RPT = 90° (raaklyn ⊥ radius). ∠QPR = 90° - ∠QPT. ∠PQR = 90° (hoek in halfwend). ∠PRQ = 90° - ∠QPR = ∠QPT. ∴ Raaklynkoord = ingeskrewe hoek in aangrensende segment. ∎",
        commonErrors: [
          "Nie deursnee teken nie.",
          "Stappe in bewys oorslaan.",
          "Raaklynkoord stelling met koordgeleding stelling verwar."
        ]
      }
    ]
  },

  "TMATH-6": {
    workedExamplesEn: [
      {
        question: "Calculate the total surface area of a cylinder with radius 5 cm and height 12 cm.",
        steps: [
          "Write the formula: TSA = 2πr² + 2πrh.",
          "Substitute values.",
          "Calculate."
        ],
        solution: "TSA = 2π(5²) + 2π(5)(12) = 2π(25) + 2π(60) = 50π + 120π = 170π ≈ 534.07 cm².",
        commonErrors: [
          "Forgetting the two circular ends (using only lateral surface 2πrh).",
          "Using diameter instead of radius.",
          "Not converting the final answer from terms of π to a decimal."
        ]
      },
      {
        question: "A cone has a base radius of 6 cm and a slant height of 10 cm. Calculate the volume.",
        steps: [
          "Find the perpendicular height using Pythagoras.",
          "Apply volume formula: V = ⅓πr²h.",
          "Calculate."
        ],
        solution: "h² = l² - r² = 10² - 6² = 100 - 36 = 64 → h = 8 cm. V = ⅓π(6²)(8) = ⅓π(36)(8) = 96π ≈ 301.59 cm³.",
        commonErrors: [
          "Using slant height in the volume formula instead of perpendicular height.",
          "Forgetting the ⅓ in the cone volume formula.",
          "Pythagoras error: adding r² and l² instead of l² - r²."
        ]
      },
      {
        question: "Convert 2.5 m² to cm².",
        steps: [
          "State the conversion factor for metres to centimetres.",
          "For area, square the linear conversion factor.",
          "Multiply."
        ],
        solution: "1 m = 100 cm. For area: 1 m² = (100 cm)² = 10 000 cm². Therefore 2.5 m² = 2.5 × 10 000 = 25 000 cm².",
        commonErrors: [
          "Using 1 m² = 100 cm² — the area factor is 10 000, not 100.",
          "Confusing area conversion with length conversion.",
          "Not squaring the conversion factor."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Bereken die totale oppervlakarea van 'n silinder met radius 5 cm en hoogte 12 cm.",
        steps: [
          "Skryf die formule: TOA = 2πr² + 2πrh.",
          "Vervang waardes.",
          "Bereken."
        ],
        solution: "TOA = 2π(25) + 2π(60) = 50π + 120π = 170π ≈ 534.07 cm².",
        commonErrors: [
          "Die twee sirkeleinde vergeet.",
          "Deursnee in plaas van radius gebruik.",
          "Finale antwoord nie van π na desimaal omskakel nie."
        ]
      },
      {
        question: "Keël met basisradius 6 cm en skuins hoogte 10 cm. Bereken die volume.",
        steps: [
          "Vind die loodreg hoogte deur Pythagoras.",
          "Pas V = ⅓πr²h toe.",
          "Bereken."
        ],
        solution: "h² = 10² - 6² = 64 → h = 8 cm. V = ⅓π(36)(8) = 96π ≈ 301.59 cm³.",
        commonErrors: [
          "Skuins hoogte in volume formule gebruik.",
          "⅓ in keël volume formule vergeet.",
          "Pythagoras fout: r² en l² optel."
        ]
      },
      {
        question: "Skakel 2.5 m² na cm² om.",
        steps: [
          "Stel die omskakelverhouding vir meter na sentimeter.",
          "Vir area, kwadrateer die lineêre omskakelverhouding.",
          "Vermenigvuldig."
        ],
        solution: "1 m = 100 cm. Vir area: 1 m² = 10 000 cm². Dus: 2.5 × 10 000 = 25 000 cm².",
        commonErrors: [
          "1 m² = 100 cm² gebruik.",
          "Oppervlak- met lengteomskakeling verwar.",
          "Nie die omskakelverhouding kwadrateer nie."
        ]
      }
    ]
  },

  "TMATH-7": {
    workedExamplesEn: [
      {
        question: "For the dataset {12, 15, 18, 20, 22, 25, 30, 35}, calculate the mean, median, mode, range and standard deviation.",
        steps: [
          "Calculate mean.",
          "Find median.",
          "Find mode.",
          "Calculate range.",
          "Calculate standard deviation."
        ],
        solution: "Mean = (12+15+18+20+22+25+30+35)/8 = 177/8 = 22.125. Median (n=8, even): average of 4th and 5th = (20+22)/2 = 21. Mode: none (all values occur once). Range = 35 - 12 = 23. Standard deviation: σ = √[Σ(xᵢ - x̄)²/n]; deviations² = 102.5, 51.6, 17.0, 4.5, 0.0, 8.3, 61.6, 165.5; sum = 411; σ = √(411/8) = √51.4 ≈ 7.17.",
        commonErrors: [
          "Median: not sorting the data first.",
          "Standard deviation: dividing by n-1 (sample SD) instead of n (population SD) — check whether the question specifies.",
          "Mode: stating the mean as the mode."
        ]
      },
      {
        question: "A scatter plot shows a positive correlation between hours studied and test marks. Draw the line of best fit and interpret the gradient.",
        steps: [
          "Plot the points.",
          "Draw the line of best fit through the 'middle' of the data.",
          "Calculate the gradient (rise/run between two points on the line).",
          "Interpret."
        ],
        solution: "Line of best fit: drawn so that approximately equal numbers of points lie above and below it. Using two points on the line: (2, 45) and (8, 75). Gradient = (75 - 45)/(8 - 2) = 30/6 = 5. Interpretation: for every additional hour studied, the test mark increases by approximately 5 marks.",
        commonErrors: [
          "Drawing the line through the first and last data point — should be through the mean of the data.",
          "Calculating gradient using data points not ON the line.",
          "No interpretation of the gradient in context."
        ]
      },
      {
        question: "The following frequency table shows test scores. Calculate the estimated mean.",
        steps: [
          "Find the midpoint of each class interval.",
          "Multiply midpoint by frequency (fx).",
          "Sum the fx column.",
          "Divide by total frequency."
        ],
        solution: "Class: 10–20 (mid=15, f=4, fx=60); 20–30 (mid=25, f=8, fx=200); 30–40 (mid=35, f=6, fx=210); 40–50 (mid=45, f=2, fx=90). Σfx = 560. Σf = 20. Estimated mean = 560/20 = 28.",
        commonErrors: [
          "Using class boundaries instead of midpoints.",
          "Not using midpoints at all — reading the lower or upper boundary as the representative value.",
          "Dividing by the number of classes instead of total frequency."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Vir datastel {12, 15, 18, 20, 22, 25, 30, 35}, bereken die gemiddeld, mediaan, modus, reeks en standaardafwyking.",
        steps: [
          "Bereken gemiddeld.",
          "Vind mediaan.",
          "Vind modus.",
          "Bereken reeks.",
          "Bereken standaardafwyking."
        ],
        solution: "Gemiddeld = 177/8 = 22.125. Mediaan: gemiddeld van 4de en 5de = 21. Modus: geen. Reeks = 23. σ ≈ 7.17.",
        commonErrors: [
          "Mediaan: data nie eerste sorteer nie.",
          "Standaardafwyking: deur n-1 in plaas van n deel.",
          "Die gemiddeld as modus stel."
        ]
      },
      {
        question: "Stippelplot wys 'n positiewe korrelasie. Teken die beste-passing lyn en interpreteer die gradient.",
        steps: [
          "Plot die punte.",
          "Teken die beste-passing lyn.",
          "Bereken die gradient.",
          "Interpreteer."
        ],
        solution: "Gradient met twee punte op die lyn: (2, 45) en (8, 75). Gradient = 30/6 = 5. Interpretasie: vir elke ekstra uur studeer, styg die toetspunt met ±5 punte.",
        commonErrors: [
          "Lyn deur die eerste en laaste datapunt teken.",
          "Gradient met datapunte BUITE die lyn bereken.",
          "Geen kontekstuele interpretasie nie."
        ]
      },
      {
        question: "Bereken die geskatte gemiddeld vir 'n frekwensietabel.",
        steps: [
          "Vind die midpunt van elke klasinterval.",
          "Vermenigvuldig midpunt met frekwensie (fx).",
          "Someer die fx-kolom.",
          "Deel deur totale frekwensie."
        ],
        solution: "10–20 (mid=15, f=4, fx=60); 20–30 (mid=25, f=8, fx=200); 30–40 (mid=35, f=6, fx=210); 40–50 (mid=45, f=2, fx=90). Σfx=560, Σf=20. Gemiddeld = 28.",
        commonErrors: [
          "Klasgrense in plaas van midpunte gebruik.",
          "Midpunte glad nie gebruik nie.",
          "Deur die getal klasse in plaas van totale frekwensie deel."
        ]
      }
    ]
  },

  "TMATH-8": {
    workedExamplesEn: [
      {
        question: "A password requires 3 letters (from A–Z, no repetition) followed by 2 digits (0–9, with repetition). How many passwords are possible?",
        steps: [
          "Calculate permutations for 3 letters (no repetition).",
          "Calculate permutations for 2 digits (with repetition).",
          "Multiply (fundamental counting principle)."
        ],
        solution: "Letters: 26 × 25 × 24 = 15 600 (no repetition). Digits: 10 × 10 = 100 (with repetition). Total = 15 600 × 100 = 1 560 000 passwords.",
        commonErrors: [
          "Using 26³ for letters (allowing repetition) instead of 26 × 25 × 24.",
          "Using 10 × 9 for digits (no repetition) when the question allows repetition.",
          "Adding instead of multiplying the separate counts."
        ]
      },
      {
        question: "A committee of 3 is chosen from 8 candidates. How many different committees are possible?",
        steps: [
          "Determine whether order matters.",
          "Apply the combination formula: C(n,r) = n!/(r!(n-r)!).",
          "Calculate."
        ],
        solution: "Order doesn't matter (a committee is the same regardless of selection order). C(8,3) = 8!/(3! × 5!) = (8 × 7 × 6)/(3 × 2 × 1) = 336/6 = 56 committees.",
        commonErrors: [
          "Using the permutation formula P(8,3) = 336 — this overcounts each committee by 3! = 6.",
          "Calculating 8! fully instead of simplifying the ratio.",
          "Confusing combinations (order doesn't matter) with permutations (order matters)."
        ]
      },
      {
        question: "A bag has 4 red and 6 blue marbles. Two are drawn without replacement. Find P(both red).",
        steps: [
          "Find P(1st red).",
          "Find P(2nd red | 1st red).",
          "Multiply."
        ],
        solution: "P(1st red) = 4/10 = 2/5. After removing 1 red: 3 red remain out of 9 total. P(2nd red | 1st red) = 3/9 = 1/3. P(both red) = 2/5 × 1/3 = 2/15.",
        commonErrors: [
          "Not adjusting the denominator after the first draw (without replacement).",
          "Using P = 4/10 × 4/10 (with replacement formula for without replacement scenario).",
          "Incorrect fraction simplification."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Wagwoord vereis 3 letters (A–Z, geen herhaling) gevolg deur 2 syfers (0–9, met herhaling). Hoeveel wagwoorde is moontlik?",
        steps: [
          "Bereken permutasies vir 3 letters.",
          "Bereken permutasies vir 2 syfers.",
          "Vermenigvuldig."
        ],
        solution: "Letters: 26 × 25 × 24 = 15 600. Syfers: 10 × 10 = 100. Totaal = 1 560 000.",
        commonErrors: [
          "26³ vir letters gebruik.",
          "10 × 9 vir syfers gebruik wanneer herhaling toegelaat word.",
          "Tellings optelling in plaas van vermenigvuldig."
        ]
      },
      {
        question: "Komitee van 3 gekies uit 8 kandidate. Hoeveel verskillende komitees is moontlik?",
        steps: [
          "Bepaal of volgorde saak maak.",
          "Pas C(n,r) = n!/(r!(n-r)!) toe.",
          "Bereken."
        ],
        solution: "Volgorde maak nie saak nie. C(8,3) = 8!/(3! × 5!) = 56.",
        commonErrors: [
          "Permutasieformule P(8,3) = 336 gebruik.",
          "8! ten volle bereken in plaas van vereenvoudig.",
          "Kombinasies (volgorde onbelangrik) met permutasies verwar."
        ]
      },
      {
        question: "Sak het 4 rooi en 6 blou knikkers. Twee word sonder vervanging getrek. Vind P(albei rooi).",
        steps: [
          "Vind P(1ste rooi).",
          "Vind P(2de rooi | 1ste rooi).",
          "Vermenigvuldig."
        ],
        solution: "P(1ste) = 4/10. P(2de|1ste) = 3/9. P(albei rooi) = 4/10 × 3/9 = 2/15.",
        commonErrors: [
          "Noemer nie aanpas na eerste trekking nie.",
          "4/10 × 4/10 gebruik (met vervanging formule).",
          "Breuk vereenvoudiging fout."
        ]
      }
    ]
  },

  // ===================== TECHNICAL SCIENCES (TSCI) =====================

  "TSCI-1": {
    workedExamplesEn: [
      {
        question: "A block of mass 5 kg is pushed along a horizontal surface by a force of 30 N. The frictional force is 10 N. Calculate the acceleration.",
        steps: [
          "Draw a free body diagram.",
          "Apply Newton's Second Law: ΣF = ma.",
          "Calculate net force.",
          "Solve for a."
        ],
        solution: "Net force = Applied - Friction = 30 - 10 = 20 N. ΣF = ma → 20 = 5 × a → a = 4 m/s². The block accelerates at 4 m/s² in the direction of the applied force.",
        commonErrors: [
          "Not subtracting friction from the applied force.",
          "Using mass in grams instead of kg.",
          "Forgetting direction — acceleration is in the direction of the net force."
        ]
      },
      {
        question: "Calculate the torque produced by a force of 80 N applied perpendicularly at the end of a spanner 0.3 m long.",
        steps: [
          "State the torque formula: τ = F × d × sinθ.",
          "Note that θ = 90° (perpendicular), so sinθ = 1.",
          "Calculate."
        ],
        solution: "τ = F × d × sin90° = 80 × 0.3 × 1 = 24 N·m. The torque is 24 Newton-metres.",
        commonErrors: [
          "Not including sinθ — only valid to omit when the force is perpendicular.",
          "Unit error: torque in N instead of N·m.",
          "Confusing torque (rotational) with force (linear)."
        ]
      },
      {
        question: "Two forces act on an object: 40 N east and 30 N north. Find the resultant force magnitude and direction.",
        steps: [
          "Draw the vector diagram.",
          "Apply Pythagoras for the resultant magnitude.",
          "Use tan to find the direction.",
          "State the resultant."
        ],
        solution: "These forces are perpendicular. Resultant = √(40² + 30²) = √(1600 + 900) = √2500 = 50 N. Direction: θ = tan⁻¹(30/40) = tan⁻¹(0.75) = 36.87° ≈ 36.9° north of east. Resultant: 50 N at 36.9° north of east.",
        commonErrors: [
          "Adding magnitudes (40 + 30 = 70) instead of using Pythagoras.",
          "Angle calculation: tan⁻¹(40/30) instead of tan⁻¹(30/40) — the angle reference must match the diagram.",
          "No direction stated — magnitude alone is insufficient for a vector."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Blok van 5 kg word deur 'n krag van 30 N gestoot. Wrywingskrag is 10 N. Bereken die versnelling.",
        steps: [
          "Teken 'n vryliggaamsdiagram.",
          "Pas Newton se Tweede Wet toe: ΣF = ma.",
          "Bereken nettokrag.",
          "Los op vir a."
        ],
        solution: "Nettokrag = 30 - 10 = 20 N. 20 = 5 × a → a = 4 m/s².",
        commonErrors: [
          "Wrywing nie van die toegepaste krag aftrek nie.",
          "Massa in gram in plaas van kg gebruik.",
          "Rigting vergeet."
        ]
      },
      {
        question: "Bereken die wringkrag deur 'n krag van 80 N loodreg aan die punt van 'n sleutelbord 0.3 m lank.",
        steps: [
          "Stel die wringkragformule: τ = F × d × sinθ.",
          "θ = 90° → sinθ = 1.",
          "Bereken."
        ],
        solution: "τ = 80 × 0.3 × 1 = 24 N·m.",
        commonErrors: [
          "sinθ nie insluit nie.",
          "Eenheidsfout: wringkrag in N.",
          "Wringkrag met krag verwar."
        ]
      },
      {
        question: "Twee kragte: 40 N oos en 30 N noord. Vind die resultante krag se grootte en rigting.",
        steps: [
          "Teken die vektorsdiagram.",
          "Pythagoras vir resultante grootte.",
          "Tan vir rigting.",
          "Stel resultante."
        ],
        solution: "Resultante = √(40² + 30²) = 50 N. θ = tan⁻¹(30/40) = 36.9° noord van oos. Resultante: 50 N teen 36.9° noord van oos.",
        commonErrors: [
          "Groottes optelling (40 + 30 = 70).",
          "Hoekberekening: tan⁻¹(40/30) in plaas van tan⁻¹(30/40).",
          "Geen rigting stel nie."
        ]
      }
    ]
  },

  "TSCI-2": {
    workedExamplesEn: [
      {
        question: "A sound wave has a frequency of 440 Hz and travels at 340 m/s. Calculate its wavelength.",
        steps: [
          "State the wave equation: v = fλ.",
          "Rearrange to find λ.",
          "Calculate."
        ],
        solution: "v = fλ → λ = v/f = 340/440 = 0.773 m ≈ 77.3 cm.",
        commonErrors: [
          "Using λ = f/v instead of v/f.",
          "Not converting the final answer to cm when appropriate.",
          "Confusing frequency (Hz = cycles/s) with period (s)."
        ]
      },
      {
        question: "A ray of light travels from water (n = 1.33) to air (n = 1.00) at an angle of 30° to the normal. Calculate the angle of refraction.",
        steps: [
          "State Snell's Law: n₁sinθ₁ = n₂sinθ₂.",
          "Identify n₁, θ₁, n₂.",
          "Solve for θ₂.",
          "Determine if total internal reflection occurs."
        ],
        solution: "n₁sinθ₁ = n₂sinθ₂ → 1.33 × sin30° = 1.00 × sinθ₂. 1.33 × 0.5 = sinθ₂ = 0.665. θ₂ = sin⁻¹(0.665) = 41.7°. The ray bends away from the normal (moving from denser to less dense medium).",
        commonErrors: [
          "Inverting n₁ and n₂.",
          "Not noting that the ray bends away from normal (water → air).",
          "Not checking for total internal reflection (critical angle for water-air ≈ 48.8°; 30° < 48.8° so refraction occurs)."
        ]
      },
      {
        question: "Describe the electromagnetic spectrum, listing 5 types of radiation in order of increasing frequency.",
        steps: [
          "List 5 types of EM radiation.",
          "Order from lowest to highest frequency.",
          "State one use for each type."
        ],
        solution: "In order of increasing frequency: 1. Radio waves (lowest frequency) — AM/FM broadcasting. 2. Microwaves — cooking, satellite communication. 3. Infrared — thermal imaging, TV remotes. 4. Visible light — human vision, photography. 5. Ultraviolet — sterilisation, sunscreen (what it blocks). [Above UV: X-rays → gamma rays at highest frequency].",
        commonErrors: [
          "Listing fewer than 5 types.",
          "Incorrect order — e.g. placing microwaves above infrared.",
          "No use stated for any radiation type."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Klankgolf het frekwensie van 440 Hz en reis teen 340 m/s. Bereken die golflengte.",
        steps: [
          "Stel golfvergelyking: v = fλ.",
          "Herrangskik om λ te vind.",
          "Bereken."
        ],
        solution: "λ = v/f = 340/440 = 0.773 m.",
        commonErrors: [
          "λ = f/v gebruik.",
          "Finale antwoord nie omskakel nie.",
          "Frekwensie (Hz) met periode (s) verwar."
        ]
      },
      {
        question: "Lig reis van water (n = 1.33) na lug (n = 1.00) teen 30° tot die normaal. Bereken die brekingshoek.",
        steps: [
          "Stel Snell se Wet: n₁sinθ₁ = n₂sinθ₂.",
          "Identifiseer n₁, θ₁, n₂.",
          "Los op vir θ₂.",
          "Bepaal of totale interne weerkaatsing plaasvind."
        ],
        solution: "1.33 × 0.5 = sinθ₂ = 0.665. θ₂ = 41.7°. Die straal buig van die normaal af.",
        commonErrors: [
          "n₁ en n₂ omruil.",
          "Nie let dat straal van normaal buig nie.",
          "Nie vir totale interne weerkaatsing kontroleer nie."
        ]
      },
      {
        question: "Beskryf die elektromagnetiese spektrum en lys 5 tipes straling in volgorde van toenemende frekwensie.",
        steps: [
          "Lys 5 tipes EM-straling.",
          "Orden van laagste na hoogste frekwensie.",
          "Stel een gebruik vir elke tipe."
        ],
        solution: "1. Radiogolwe (laagste frekwensie) — AM/FM uitsendings. 2. Mikrogolwe — kook. 3. Infrarooi — termiese beelding. 4. Sigbare lig — menslike visie. 5. Ultraviolet — sterilisasie.",
        commonErrors: [
          "Minder as 5 tipes lys.",
          "Verkeerde volgorde.",
          "Geen gebruik vir enige stralingtipe nie."
        ]
      }
    ]
  },

  "TSCI-3": {
    workedExamplesEn: [
      {
        question: "Three resistors of 4Ω, 6Ω and 12Ω are connected in parallel. Calculate the equivalent resistance.",
        steps: [
          "State the parallel resistance formula.",
          "Substitute values.",
          "Calculate."
        ],
        solution: "1/R_eq = 1/4 + 1/6 + 1/12 = 3/12 + 2/12 + 1/12 = 6/12 = 1/2. R_eq = 2Ω. Note: the equivalent resistance of a parallel combination is always LESS than the smallest individual resistance (2Ω < 4Ω ✓).",
        commonErrors: [
          "Adding resistances directly (4 + 6 + 12 = 22Ω) — this is the series formula.",
          "Forgetting to take the reciprocal at the end (getting 1/2 instead of 2Ω).",
          "Not checking reasonableness (answer must be less than 4Ω)."
        ]
      },
      {
        question: "Ohm's Law: a 12V battery drives a current of 3A through a resistor. Calculate the resistance and power dissipated.",
        steps: [
          "Apply Ohm's Law: V = IR.",
          "Calculate R.",
          "Apply P = IV.",
          "Calculate P."
        ],
        solution: "R = V/I = 12/3 = 4Ω. P = IV = 3 × 12 = 36W. Or P = I²R = 9 × 4 = 36W ✓.",
        commonErrors: [
          "Using P = V/I instead of P = IV.",
          "Confusing the power formulas (P = IV = V²/R = I²R — all are equivalent).",
          "Unit error: power in volts or amps instead of watts."
        ]
      },
      {
        question: "A straight conductor of length 0.5 m carries a current of 8 A in a magnetic field of 0.3 T (perpendicular). Calculate the force on the conductor.",
        steps: [
          "State the formula: F = BIL sinθ.",
          "Identify that θ = 90° (perpendicular).",
          "Calculate."
        ],
        solution: "F = BIL sinθ = 0.3 × 8 × 0.5 × sin90° = 0.3 × 8 × 0.5 × 1 = 1.2 N.",
        commonErrors: [
          "Forgetting sinθ — only correct to omit when θ = 90°.",
          "Confusing the formula with Ohm's Law.",
          "Unit of B: Tesla (T), not teslas per metre."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Drie weerstanders van 4Ω, 6Ω en 12Ω parallel verbind. Bereken die ekwivalente weerstand.",
        steps: [
          "Stel parallelle weerstandformule.",
          "Vervang waardes.",
          "Bereken."
        ],
        solution: "1/R = 1/4 + 1/6 + 1/12 = 6/12 = 1/2. R = 2Ω. Ekwivalente weerstand MINDER as kleinste individuele weerstand (2Ω < 4Ω ✓).",
        commonErrors: [
          "Weerstanders direk optelling (reekseformule gebruik).",
          "Vergeet om die omgekeerde te neem.",
          "Redelikheid nie kontroleer nie."
        ]
      },
      {
        question: "12V battery dryf 3A deur 'n weerstand. Bereken die weerstand en gedissipeerde vermoë.",
        steps: [
          "Pas Ohm se Wet toe: V = IR.",
          "Bereken R.",
          "Pas P = IV toe.",
          "Bereken P."
        ],
        solution: "R = 12/3 = 4Ω. P = 3 × 12 = 36W.",
        commonErrors: [
          "P = V/I gebruik.",
          "Vermoëformules verwar.",
          "Eenheidsfout: vermoë in volt of ampère."
        ]
      },
      {
        question: "Reguit geleier 0.5 m lank dra 8 A in magneetveld 0.3 T (loodreg). Bereken die krag.",
        steps: [
          "Stel F = BIL sinθ.",
          "θ = 90° → sin90° = 1.",
          "Bereken."
        ],
        solution: "F = 0.3 × 8 × 0.5 × 1 = 1.2 N.",
        commonErrors: [
          "sinθ vergeet.",
          "Formule met Ohm se Wet verwar.",
          "Eenheid van B: Tesla."
        ]
      }
    ]
  },

  "TSCI-4": {
    workedExamplesEn: [
      {
        question: "Describe the trends in atomic radius and ionisation energy across Period 3 of the periodic table.",
        steps: [
          "State the trend in atomic radius → explain why.",
          "State the trend in ionisation energy → explain why.",
          "Give the relationship between the two trends."
        ],
        solution: "Atomic radius: decreases across Period 3 (Na → Ar). Reason: the number of protons increases while the electrons are added to the same shell — stronger nuclear attraction pulls electrons closer. Ionisation energy: generally increases across Period 3. Reason: smaller atomic radius means the outermost electron is held more tightly and requires more energy to remove. Relationship: inverse — as radius decreases, ionisation energy increases. Note: there are two exceptions (Al < Si and S < P due to sub-shell effects).",
        commonErrors: [
          "Stating atomic radius increases (it decreases across a period).",
          "No explanation — trends without reasons score only half marks.",
          "Not mentioning the sub-shell exceptions (Al and S)."
        ]
      },
      {
        question: "Explain ionic, covalent and metallic bonding with one example of each.",
        steps: [
          "Define ionic bonding → example.",
          "Define covalent bonding → example.",
          "Define metallic bonding → example."
        ],
        solution: "Ionic: electrons are transferred from a metal to a non-metal; oppositely charged ions attract. Example: NaCl (sodium chloride — Na⁺ and Cl⁻). Covalent: electrons are shared between non-metal atoms. Example: H₂O (water — each H shares one electron pair with O). Metallic: positive metal cations surrounded by a 'sea of delocalised electrons'. Example: copper (Cu) — conducts electricity because electrons move freely.",
        commonErrors: [
          "Confusing ionic (transfer) with covalent (sharing).",
          "No example for any bond type.",
          "Stating metallic bonding involves electron transfer — it involves delocalisation."
        ]
      },
      {
        question: "Explain why water has a higher boiling point than expected for its molecular mass, compared to H₂S.",
        steps: [
          "Compare the molecular masses.",
          "Identify the intermolecular forces in each.",
          "Explain why water's forces are stronger.",
          "Connect to boiling point."
        ],
        solution: "H₂O (MM = 18) vs H₂S (MM = 34) — H₂S is heavier yet has a lower boiling point (-60°C) than H₂O (100°C). Water: strong hydrogen bonds form between the highly electronegative O atom and H atoms — H-bonds are the strongest type of intermolecular force (dipole-dipole). H₂S: only weak van der Waals/London dispersion forces (less electronegative S). Boiling point: more energy (higher temperature) needed to break the stronger H-bonds in water.",
        commonErrors: [
          "Saying water boils higher because it is lighter — mass alone doesn't explain it.",
          "Confusing intermolecular forces with intramolecular (covalent) bonds.",
          "Not naming hydrogen bonding specifically."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Beskryf die neigings in atoommodulus en ioniseringsenergie oor Periode 3 van die periodieke tabel.",
        steps: [
          "Stel die neiging in atoommodulus → verduidelik.",
          "Stel die neiging in ioniseringsenergie → verduidelik.",
          "Gee die verwantskap tussen die twee neigings."
        ],
        solution: "Atoommodulus: neem af oor Periode 3. Rede: meer protone trek elektrone in dieselfde skulp nader. Ioniseringsenergie: neem oor die algemeen toe. Rede: kleiner atoommodulus = elektron styf vasgehou. Verwantskap: omgekeerd — soos radius afneem, neem ioniseringsenergie toe.",
        commonErrors: [
          "Sê atoommodulus neem toe.",
          "Geen verduideliking nie.",
          "Nie die sub-skulp uitsonderings noem nie."
        ]
      },
      {
        question: "Verduidelik ionies, kovalent en metalliese binding met een voorbeeld van elk.",
        steps: [
          "Definieer ioniese binding → voorbeeld.",
          "Definieer kovalente binding → voorbeeld.",
          "Definieer metalliese binding → voorbeeld."
        ],
        solution: "Ionies: elektrone oorgedra van metaal na nie-metaal. Voorbeeld: NaCl. Kovalent: elektrone gedeel tussen nie-metaalAtome. Voorbeeld: H₂O. Metallies: positiewe metaalkatione omring deur 'n 'see' van gedelokaliseerde elektrone. Voorbeeld: koper.",
        commonErrors: [
          "Ionies (oordrag) met kovalent (deling) verwar.",
          "Geen voorbeeld nie.",
          "Sê metalliese binding elektroonoordrag behels."
        ]
      },
      {
        question: "Verduidelik waarom water 'n hoër kookpunt as verwag het vir sy molekulêre massa in vergelyking met H₂S.",
        steps: [
          "Vergelyk die molekulêre massas.",
          "Identifiseer die intermolekulêre kragte in elk.",
          "Verduidelik waarom water se kragte sterker is.",
          "Koppel aan kookpunt."
        ],
        solution: "H₂O (MM=18) vs H₂S (MM=34) — H₂S is swaarder maar het 'n laer kookpunt (-60°C) as H₂O (100°C). Water: sterk waterstofbindinge tussen hoogs elektronegatiewe O en H. H₂S: slegs swak Van der Waals kragte. Kookpunt: meer energie nodig om sterker H-bindinge in water te breek.",
        commonErrors: [
          "Sê water kook hoër omdat dit ligter is.",
          "Intermolekulêre kragte met intramolekulêre (kovalente) bindings verwar.",
          "Waterstofbinding nie spesifiek noem nie."
        ]
      }
    ]
  },

  "TSCI-5": {
    workedExamplesEn: [
      {
        question: "Balance the equation: Fe + HCl → FeCl₂ + H₂",
        steps: [
          "Write the unbalanced equation.",
          "Count atoms of each element on each side.",
          "Balance by adjusting coefficients.",
          "Verify."
        ],
        solution: "Unbalanced: Fe + HCl → FeCl₂ + H₂. Cl: 1 (left) vs 2 (right) → need 2HCl on left. H: now 2 (left) vs 2 (right) ✓. Fe: 1 vs 1 ✓. Balanced: Fe + 2HCl → FeCl₂ + H₂.",
        commonErrors: [
          "Changing subscripts instead of coefficients — subscripts define the compound and cannot be changed.",
          "Balancing one element at the cost of unbalancing another.",
          "Not verifying all atoms are balanced."
        ]
      },
      {
        question: "Explain Le Chatelier's Principle and apply it to the reaction: N₂ + 3H₂ ⇌ 2NH₃ (ΔH = -92 kJ). What happens when: (a) pressure is increased, (b) temperature is increased?",
        steps: [
          "State Le Chatelier's Principle.",
          "Apply to pressure change (a).",
          "Apply to temperature change (b)."
        ],
        solution: "Le Chatelier's Principle: if a system at equilibrium is disturbed, it shifts to minimise the disturbance. (a) Increased pressure: the system favours the side with fewer moles of gas. Left = 1+3 = 4 moles; Right = 2 moles. Shift RIGHT → more NH₃ produced. (b) Increased temperature: the reaction is exothermic (ΔH < 0) → adding heat shifts equilibrium to absorb heat → shifts LEFT → less NH₃ produced, more N₂ and H₂.",
        commonErrors: [
          "Confusing the direction of shift for exothermic reactions — increased T shifts LEFT for exothermic.",
          "Not counting moles of gas correctly for pressure changes.",
          "Confusing equilibrium position with rate — both forward and reverse rates increase with temperature, but the equilibrium shifts left."
        ]
      },
      {
        question: "Calculate the molar mass and number of moles in 44 g of CO₂.",
        steps: [
          "Calculate molar mass of CO₂.",
          "Apply n = m/M.",
          "Calculate."
        ],
        solution: "Molar mass of CO₂ = 12 + (2 × 16) = 12 + 32 = 44 g/mol. n = m/M = 44/44 = 1 mol.",
        commonErrors: [
          "Using the mass number of carbon as 14 (that's nitrogen) — carbon is 12.",
          "Forgetting to multiply the oxygen by 2.",
          "Confusing moles with molecules — 1 mol = 6.022 × 10²³ molecules."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Balanseer: Fe + HCl → FeCl₂ + H₂",
        steps: [
          "Skryf die ongebalanseerde vergelyking.",
          "Tel atome van elke element.",
          "Balanseer deur koëffisiënte aan te pas.",
          "Verifieer."
        ],
        solution: "Ongebalanseerd: Fe + HCl → FeCl₂ + H₂. Cl: 1 vs 2 → benodig 2HCl links. Gebalanseerd: Fe + 2HCl → FeCl₂ + H₂.",
        commonErrors: [
          "Subskrifte verander in plaas van koëffisiënte.",
          "Een element balanseer ten koste van 'n ander.",
          "Nie verifieer nie."
        ]
      },
      {
        question: "Verduidelik Le Chatelier se Beginsel en pas dit toe op: N₂ + 3H₂ ⇌ 2NH₃ (ΔH = -92 kJ). Wat gebeur as: (a) druk verhoog, (b) temperatuur verhoog?",
        steps: [
          "Stel Le Chatelier se Beginsel.",
          "Pas toe op drukverandering (a).",
          "Pas toe op temperatuurverandering (b)."
        ],
        solution: "(a) Verhoogde druk: stelsel begunstig kant met minder molgas. Links = 4 mol; Regs = 2 mol. Verskuif REGS → meer NH₃. (b) Verhoogde temperatuur: reaksie is eksotermies → voeg hitte → verskuif LINKS → minder NH₃.",
        commonErrors: [
          "Rigting vir eksotormiese reaksies verwar.",
          "Molgas nie korrek tel nie.",
          "Ewewigsposisie met snelheid verwar."
        ]
      },
      {
        question: "Bereken die molarmassa en aantal mol in 44 g CO₂.",
        steps: [
          "Bereken molarmassa van CO₂.",
          "Pas n = m/M toe.",
          "Bereken."
        ],
        solution: "M(CO₂) = 12 + 32 = 44 g/mol. n = 44/44 = 1 mol.",
        commonErrors: [
          "Massagetal van koolstof as 14 gebruik.",
          "Suurstof nie met 2 vermenigvuldig nie.",
          "Mol met molekules verwar."
        ]
      }
    ]
  },

  "TSCI-6": {
    workedExamplesEn: [
      {
        question: "Explain the mechanical advantage (MA) of a simple lever and calculate the MA for an effort arm of 1.5 m and a load arm of 0.5 m.",
        steps: [
          "Define mechanical advantage.",
          "State the formula for a lever.",
          "Calculate.",
          "Interpret."
        ],
        solution: "Mechanical advantage (MA): the ratio of the output force (load) to the input force (effort) — indicates how much a machine multiplies force. MA = Effort arm/Load arm = 1.5/0.5 = 3. Interpretation: the lever multiplies the effort 3 times — an effort of 100 N can lift a load of 300 N.",
        commonErrors: [
          "Inverting the ratio (load arm/effort arm = 0.33) — this gives a mechanical disadvantage.",
          "Confusing effort arm with load arm.",
          "No interpretation of what the MA value means."
        ]
      },
      {
        question: "Describe how a hydraulic press works and calculate the output force if: input force = 50 N, input piston area = 0.002 m², output piston area = 0.02 m².",
        steps: [
          "State Pascal's Principle.",
          "Write the pressure equation.",
          "Calculate output pressure.",
          "Calculate output force."
        ],
        solution: "Pascal's Principle: pressure applied to a confined fluid is transmitted equally in all directions. Pressure = Force/Area. Input pressure P = 50/0.002 = 25 000 Pa. Output pressure = input pressure (Pascal's Law). Output force = P × A₂ = 25 000 × 0.02 = 500 N. MA = 500/50 = 10.",
        commonErrors: [
          "Confusing area and diameter.",
          "Forgetting that output and input pressures are equal in a hydraulic system.",
          "Not calculating the MA from the result."
        ]
      },
      {
        question: "Explain the energy conversion chain in a coal-fired power station from fuel to electrical energy.",
        steps: [
          "Stage 1: chemical energy in coal.",
          "Stage 2: thermal energy from combustion.",
          "Stage 3: kinetic energy of steam.",
          "Stage 4: mechanical energy in turbine.",
          "Stage 5: electrical energy from generator."
        ],
        solution: "1. Chemical energy: coal (stored carbon compounds) is burned in a furnace. 2. Thermal energy: combustion heats water in a boiler to produce high-pressure steam. 3. Kinetic energy: steam expands and drives turbine blades (kinetic energy of rotation). 4. Mechanical energy: turbine shaft rotates the generator rotor. 5. Electrical energy: rotating magnetic field induces current in the generator coil (electromagnetic induction). Energy is lost as heat at each conversion step — overall efficiency typically 33–40%.",
        commonErrors: [
          "Skipping a stage — each conversion must be stated.",
          "Confusing turbine (converts thermal to mechanical) with generator (converts mechanical to electrical).",
          "No mention of energy losses at each stage."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die meganiese voordeel (MV) van 'n eenvoudige hefboom en bereken MV as pogingsarm = 1.5 m en lasarm = 0.5 m.",
        steps: [
          "Definieer meganiese voordeel.",
          "Stel die formule vir 'n hefboom.",
          "Bereken.",
          "Interpreteer."
        ],
        solution: "MV = Pogingsarm/Lasarm = 1.5/0.5 = 3. Interpretasie: die hefboom vermenigvuldig die poging 3 keer — 100 N poging kan 300 N las lig.",
        commonErrors: [
          "Verhouding omruil (lasarm/pogingsarm = 0.33).",
          "Pogingsarm met lasarm verwar.",
          "Geen interpretasie van MV nie."
        ]
      },
      {
        question: "Beskryf hoe 'n hidrouliese pers werk. Berekening: insetpogingskrag = 50 N, insetkuiper = 0.002 m², uitsetkuiper = 0.02 m².",
        steps: [
          "Stel Pascal se Beginsel.",
          "Skryf die drukvergelyking.",
          "Bereken uitsetdruk.",
          "Bereken uitsetkrag."
        ],
        solution: "Druk = Krag/Oppervlak. Insetdruk P = 50/0.002 = 25 000 Pa. Uitsetkrag = 25 000 × 0.02 = 500 N. MV = 10.",
        commonErrors: [
          "Oppervlak en deursnee verwar.",
          "Vergeet dat uitset- en insetdruk gelyk is.",
          "MV nie bereken nie."
        ]
      },
      {
        question: "Verduidelik die energieomsettingsketting in 'n steenkool-kragstasie van brandstof na elektriese energie.",
        steps: [
          "Fase 1: chemiese energie in steenkool.",
          "Fase 2: termiese energie van verbranding.",
          "Fase 3: kinetiese energie van stoom.",
          "Fase 4: meganiese energie in turbine.",
          "Fase 5: elektriese energie van generator."
        ],
        solution: "1. Chemiese energie: steenkool brand in 'n oond. 2. Termiese energie: verbranding verhit water tot stoom. 3. Kinetiese energie: stoom dryf turbinlemme. 4. Meganiese energie: turbinas draai die generatorrotor. 5. Elektriese energie: roterende magneetveld induseer stroom (elektromagnetiese induksie). Energie gaan by elke omsetting as hitte verlore.",
        commonErrors: [
          "'n Fase oorslaan.",
          "Turbine (termiese na meganiese) met generator (meganiese na elektriese) verwar.",
          "Geen vermelding van energieverliese nie."
        ]
      }
    ]
  },

  // ===================== RELIGION STUDIES (RELI) =====================

  "RELI-1": {
    workedExamplesEn: [
      {
        question: "Distinguish between 'religion' and 'belief' and explain why the relationship between them is complex.",
        steps: [
          "Define religion.",
          "Define belief.",
          "Explain the overlap.",
          "State a case where belief exists without formal religion."
        ],
        solution: "Religion: a structured system of beliefs, rituals, moral codes and community practices, usually centred on the sacred or transcendent (Durkheim: 'a unified system of beliefs and practices relative to sacred things'). Belief: an individual's conviction that something is true — can be religious or non-religious. Overlap: all religions contain beliefs, but not all beliefs constitute religion. Complexity: a person may hold deep spiritual beliefs (e.g. belief in an afterlife or moral laws) without belonging to any organised religion — this is sometimes called 'believing without belonging' (Grace Davie). Conversely, people may participate in religious rituals without personal belief ('belonging without believing').",
        commonErrors: [
          "Treating religion and belief as synonyms.",
          "No acknowledgment of religion without belief or belief without religion.",
          "Using only one scholar's definition."
        ]
      },
      {
        question: "Explain the phenomenological approach to the study of religion and state its strengths and limitations.",
        steps: [
          "Define phenomenology in the context of religion.",
          "State two strengths.",
          "State two limitations."
        ],
        solution: "Phenomenological approach: the study of religion 'from the inside' — attempting to understand religious experience and meaning as adherents themselves experience it (epoché: suspending personal judgment). Associated with Ninian Smart (7 dimensions of religion). Strengths: respects diversity; avoids imposing outsider biases; captures the 'lived experience' of religion. Limitations: difficult to achieve true neutrality (the researcher always brings assumptions); neglects power dynamics and social critique; risks romanticising or uncritically accepting religious claims.",
        commonErrors: [
          "Confusing phenomenology with phenomenalism (philosophy of perception).",
          "No specific scholar mentioned.",
          "Only strengths OR only limitations."
        ]
      },
      {
        question: "Describe three functions of religion in society, drawing on one sociological theorist for each.",
        steps: [
          "Function 1 → theorist.",
          "Function 2 → theorist.",
          "Function 3 → theorist."
        ],
        solution: "1. Social cohesion (Durkheim): religion binds communities through shared rituals and sacred symbols, creating collective identity and solidarity. 2. Social control (Marx): religion pacifies the oppressed by promising rewards in the afterlife ('opium of the people'), thereby maintaining the status quo. 3. Meaning-making (Weber): religion provides a framework of meaning (theodicy) that explains suffering and gives purpose — the Protestant Ethic linked religious belief to rational economic behaviour.",
        commonErrors: [
          "No theorist named.",
          "Describing functions without explaining the mechanism.",
          "Only one function given."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Onderskei tussen 'godsdiens' en 'geloof' en verduidelik waarom die verwantskap tussen hulle kompleks is.",
        steps: [
          "Definieer godsdiens.",
          "Definieer geloof.",
          "Verduidelik die oorvleueling.",
          "Stel 'n geval waar geloof sonder formele godsdiens bestaan."
        ],
        solution: "Godsdiens: 'n gestruktureerde stelsel van oortuigings, rituele en gemeenskapspraktyke (Durkheim). Geloof: 'n individu se oortuiging dat iets waar is. Oorvleueling: alle godsdienste bevat geloof, maar nie alle geloof vorm godsdiens. Kompleksiteit: iemand kan diep geestelike oortuigings hê sonder enige georganiseerde godsdiens ('glo sonder om te behoort' — Grace Davie).",
        commonErrors: [
          "Godsdiens en geloof as sinonieme behandel.",
          "Geen erkenning van godsdiens sonder geloof of geloof sonder godsdiens nie.",
          "Slegs een geleerde se definisie gebruik."
        ]
      },
      {
        question: "Verduidelik die fenomenologiese benadering tot die studie van godsdiens en stel sy sterktes en beperkings.",
        steps: [
          "Definieer fenomenologie in die konteks van godsdiens.",
          "Stel twee sterktes.",
          "Stel twee beperkings."
        ],
        solution: "Fenomenologiese benadering: studie van godsdiens 'van binne' — probeer om godsdienstige ondervinding soos aanhanklike dit ervaar te verstaan (epoché). Ninian Smart (7 dimensies). Sterktes: respekteer diversiteit; vermyd die opleg van buitenstaanderordeelinge. Beperkings: moeilik om ware neutraliteit te bereik; verwaarloos magsdinamika.",
        commonErrors: [
          "Fenomenologie met fenomenalisme verwar.",
          "Geen spesifieke geleerde nie.",
          "Slegs sterktes OF slegs beperkings."
        ]
      },
      {
        question: "Beskryf drie funksies van godsdiens in die samelewing, met gebruik van een sosiologiese teoretikus vir elk.",
        steps: [
          "Funksie 1 → teoretikus.",
          "Funksie 2 → teoretikus.",
          "Funksie 3 → teoretikus."
        ],
        solution: "1. Sosiale kohesie (Durkheim): godsdiens bind gemeenskappe deur gedeelde rituele. 2. Sosiale beheer (Marx): godsdiens paai die onderdruktes ('opium van die mense'). 3. Betekenisvorming (Weber): godsdiens bied 'n betekenisraamwerk — Protestantse Etiek het godsdienstige oortuiging aan ekonomiese gedrag gekoppel.",
        commonErrors: [
          "Geen teoretikus noem nie.",
          "Funksies sonder die meganisme beskryf.",
          "Slegs een funksie gee."
        ]
      }
    ]
  },

  "RELI-2": {
    workedExamplesEn: [
      {
        question: "Apply deontological ethics to the issue of euthanasia.",
        steps: [
          "Define deontological ethics.",
          "Apply the categorical imperative (Kant).",
          "State the deontological position on euthanasia.",
          "Give one counter-consideration."
        ],
        solution: "Deontological ethics: moral actions are judged by their adherence to rules or duties, regardless of consequences (Kant). Categorical Imperative: 'Act only according to that maxim by which you can at the same time will that it should become a universal law.' Applied to euthanasia: the maxim 'it is permissible to end a person's life when suffering' — universalised, this could permit arbitrary killing, violating the duty to respect human life as an end in itself (Formula of Humanity). Deontological position: euthanasia is morally wrong because it violates the absolute duty to preserve human life and treats the person as a means (to end suffering) rather than an end. Counter-consideration: a strict deontological reading may seem callous when applied to a person in irreversible pain — this is where consequentialists argue the duty framework falls short.",
        commonErrors: [
          "Applying consequentialist reasoning and calling it deontological.",
          "No reference to Kant or the categorical imperative.",
          "No counter-consideration — the question asks for critical engagement."
        ]
      },
      {
        question: "Describe the utilitarian approach to environmental ethics and apply it to a decision about mining in a protected nature reserve.",
        steps: [
          "Define utilitarianism.",
          "Apply the greatest happiness principle to the mining decision.",
          "State the utilitarian conclusion.",
          "Give a limitation of this approach."
        ],
        solution: "Utilitarianism (Bentham/Mill): an action is morally right if it produces the greatest happiness for the greatest number. Mining decision: calculate total benefits (jobs, economic growth, state revenue, community upliftment) vs total harms (loss of biodiversity, ecosystem services, tourism income, long-term environmental damage, health impacts). If harms (aggregated across all affected parties, including future generations) outweigh benefits → mining is wrong. Utilitarian conclusion: depends on the numbers — a utilitarian supports mining only if the measurable net benefit is positive and distributed fairly. Limitation: how do you quantify biodiversity loss or the wellbeing of animals? Utilitarianism is only as good as its calculations.",
        commonErrors: [
          "Stating utilitarianism simply means 'majority rules' — it requires weighing total wellbeing, not just counting heads.",
          "No limitation given.",
          "Not applying the calculation to both sides of the debate."
        ]
      },
      {
        question: "Explain the virtue ethics approach to human rights and give one example.",
        steps: [
          "Define virtue ethics.",
          "Explain how virtues relate to human rights.",
          "Give an example.",
          "State a strength of this approach."
        ],
        solution: "Virtue ethics (Aristotle): ethical behaviour flows from cultivating virtuous character traits (justice, compassion, courage, honesty) rather than following rules or calculating consequences. Relationship to human rights: a virtuous person acts with justice and compassion — recognising the dignity of others comes naturally from a well-developed character. Example: a medical practitioner who upholds patient confidentiality not because the rules say so, but because honesty and respect are virtues they have internalised. Strength: produces people who do good habitually, not merely when being watched — virtue ethics aims at character formation.",
        commonErrors: [
          "Confusing virtue ethics with consequentialism.",
          "No example given.",
          "No strength stated."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Pas deontologiese etiek toe op die kwessie van eutanasie.",
        steps: [
          "Definieer deontologiese etiek.",
          "Pas die kategoriese imperatief (Kant) toe.",
          "Stel die deontologiese posisie oor eutanasie.",
          "Gee een teen-oorweging."
        ],
        solution: "Deontologiese etiek: morele aksies word beoordeel deur hul gehoorsaamheid aan reëls (Kant). Kategoriese Imperatief: handel slegs volgens die maksime wat jy as universele wet kan wil. Eutanasie: die maksime 'dit is toelaatbaar om 'n persoon se lewe te beëindig' — universeel → kan willekeurige doding toelaat. Deontologiese posisie: eutanasie is moreel verkeerd. Teen-oorweging: streng deontologie kan harteloos lyk by iemand in onherstelbare pyn.",
        commonErrors: [
          "Gevolglikheiddenke toepas en deontologies noem.",
          "Geen verwysing na Kant nie.",
          "Geen teen-oorweging nie."
        ]
      },
      {
        question: "Beskryf die utilistiese benadering tot omgewingsetiek en pas dit toe op mynbou in 'n beskermde naturreservaat.",
        steps: [
          "Definieer utilisme.",
          "Pas die grootste gelukbeginsel toe.",
          "Stel die utilitistiese gevolgtrekking.",
          "Gee 'n beperking."
        ],
        solution: "Utilisme (Bentham/Mill): aksie is moreel reg as dit die grootste geluk vir die grootste getal produseer. Mynbousbesluit: bereken voordele (werksgeleenthede, ekonomiese groei) vs skade (biodiversiteitsverlies). Utilitistiese gevolgtrekking: hang af van die syfers. Beperking: hoe kwantifiseer jy biodiversiteitsverlies?",
        commonErrors: [
          "Sê utilisme beteken bloot 'meerderheid reël'.",
          "Geen beperking gee nie.",
          "Nie die berekening op beide kante toepas nie."
        ]
      },
      {
        question: "Verduidelik die deugde-etiese benadering tot menseregte en gee een voorbeeld.",
        steps: [
          "Definieer deugde-etiek.",
          "Verduidelik hoe deugdes tot menseregte verhouding hou.",
          "Gee 'n voorbeeld.",
          "Stel 'n sterkte van hierdie benadering."
        ],
        solution: "Deugde-etiek (Aristoteles): etiese gedrag vloei uit die kweek van deugdelike karaktereienskappe. Verhouding tot menseregte: 'n deugdelike persoon erken die waardigheid van andere. Voorbeeld: mediese praktisyn wat pasiëntvertroulikheid handhaaf nie omdat die reëls dit sê nie, maar omrede eerlikheid 'n deug is. Sterkte: produseer mense wat goed doen uit gewoonte.",
        commonErrors: [
          "Deugde-etiek met gevolglikheiddenke verwar.",
          "Geen voorbeeld nie.",
          "Geen sterkte stel nie."
        ]
      }
    ]
  },

  "RELI-3": {
    workedExamplesEn: [
      {
        question: "Compare the concepts of the afterlife in Christianity and Islam.",
        steps: [
          "Christian concept of afterlife.",
          "Islamic concept of afterlife.",
          "Key similarities.",
          "Key differences."
        ],
        solution: "Christianity: after death, the soul faces judgment; believers who accept Christ are granted eternal life in heaven (a state of communion with God); the unrighteous face hell; bodily resurrection at the Last Judgment. Islam: after death, souls enter Barzakh (an intermediate state until Judgment Day); on Judgment Day, deeds are weighed on the Mizan (scales); the righteous enter Jannah (paradise — a physical garden of pleasure); the unrighteous enter Jahannam (hell). Similarities: both affirm physical resurrection at a final judgment; both have concepts of heaven and hell; both tie afterlife to moral accountability. Differences: Islam emphasises deeds on the scales; Christianity emphasises faith in Christ for salvation; Barzakh has no exact Christian parallel.",
        commonErrors: [
          "Describing only one religion.",
          "No similarities identified.",
          "Confusing Islamic Jannah with Buddhist Nirvana."
        ]
      },
      {
        question: "Identify the Four Noble Truths of Buddhism and explain how they form a coherent framework.",
        steps: [
          "First Noble Truth.",
          "Second Noble Truth.",
          "Third Noble Truth.",
          "Fourth Noble Truth.",
          "Explain the coherence."
        ],
        solution: "1st: Dukkha — life is characterised by suffering, unsatisfactoriness and impermanence. 2nd: Samudaya — suffering arises from craving, desire and attachment (tanha). 3rd: Nirodha — suffering can cease; liberation (Nirvana) is possible by eliminating desire. 4th: Magga — the path to the cessation of suffering is the Noble Eightfold Path (right view, intention, speech, action, livelihood, effort, mindfulness, concentration). Coherence: the Four Truths form a diagnostic framework — diagnosis (dukkha), cause (tanha), prognosis (nirodha), treatment (magga) — resembling a medical model.",
        commonErrors: [
          "Listing only the names without explaining them.",
          "Confusing the 3rd and 4th truths.",
          "No explanation of how they form a coherent system."
        ]
      },
      {
        question: "Describe the Five Pillars of Islam and explain their significance for Muslim daily life.",
        steps: [
          "Pillar 1 → significance.",
          "Pillar 2 → significance.",
          "Pillar 3 → significance.",
          "Pillar 4 → significance.",
          "Pillar 5 → significance."
        ],
        solution: "1. Shahada (Declaration of faith: 'There is no god but Allah, and Muhammad is his messenger'): central to identity — recited at birth and death, the entry point into Islam. 2. Salah (Prayer — 5 times daily): structures the day around God; maintains spiritual discipline. 3. Zakat (Almsgiving — 2.5% of savings): purifies wealth; redistributes to the poor; embodies social solidarity. 4. Sawm (Fasting during Ramadan): spiritual discipline; empathy with the hungry; community cohesion (all Muslims fast together). 5. Hajj (Pilgrimage to Mecca, once in a lifetime if able): unites Muslims globally in a shared act of worship; commemorates Ibrahim's (Abraham's) submission to Allah.",
        commonErrors: [
          "Only 3–4 Pillars listed.",
          "Names given without significance.",
          "Confusing Zakat (obligatory) with Sadaqa (voluntary charity)."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Vergelyk die konsepte van die lewe na die dood in Christendom en Islam.",
        steps: [
          "Christelike lewe na die dood.",
          "Islamitiese lewe na die dood.",
          "Sleutels ooreenkomste.",
          "Sleutel verskille."
        ],
        solution: "Christendom: siel staar oordeel in die gesig; gelowiges ewig lewe in hemel; liggaamlike opstanding op die Laaste Oordeel. Islam: siele gaan na Barzakh; op Oordeel sdag word dade op die Mizan geweeg; regterdiges gaan na Jannah; onregterdiges na Jahannam. Ooreenkomste: liggaamlike opstanding, hemel en hel, morele aanspreeklikheid. Verskille: Islam beklemtoon dade; Christendom geloof in Christus.",
        commonErrors: [
          "Slegs een godsdiens beskryf.",
          "Geen ooreenkomste identifiseer nie.",
          "Islamitiese Jannah met Boeddhistiese Nirwana verwar."
        ]
      },
      {
        question: "Identifiseer die Vier Edele Waarhede van Boeddhisme en verduidelik hoe hulle 'n samehangende raamwerk vorm.",
        steps: [
          "Eerste Edele Waarheid.",
          "Tweede Edele Waarheid.",
          "Derde Edele Waarheid.",
          "Vierde Edele Waarheid.",
          "Verduidelik die samehang."
        ],
        solution: "1ste: Dukkha — lewe is lyding. 2de: Samudaya — lyding kom van begeertes. 3de: Nirodha — lyding kan ophou. 4de: Magga — die Edele Agtledige Pad. Samehang: diagnostiese raamwerk — diagnose (dukkha), oorsaak (tanha), prognose (nirodha), behandeling (magga).",
        commonErrors: [
          "Slegs die name lys sonder verduideliking.",
          "Die 3de en 4de waarhede verwar.",
          "Geen verduideliking van samehang nie."
        ]
      },
      {
        question: "Beskryf die Vyf Pilare van Islam en verduidelik hul betekenis vir Moslem-daaglikse lewe.",
        steps: [
          "Pilaar 1 → betekenis.",
          "Pilaar 2 → betekenis.",
          "Pilaar 3 → betekenis.",
          "Pilaar 4 → betekenis.",
          "Pilaar 5 → betekenis."
        ],
        solution: "1. Shahada: identiteitsverklaring. 2. Salah: 5 daaaglikse gebede. 3. Zakat: 2.5% van spaargeld aan armes. 4. Sawm: vasten tydens Ramadaan. 5. Hajj: bedevaart na Mekka.",
        commonErrors: [
          "Slegs 3–4 Pilare lys.",
          "Name sonder betekenis.",
          "Zakat (verpligtend) met Sadaqa (vrywillig) verwar."
        ]
      }
    ]
  },

  "RELI-4": {
    workedExamplesEn: [
      {
        question: "Analyse the relationship between religion and politics in post-apartheid South Africa.",
        steps: [
          "Describe the role of religion during apartheid.",
          "Describe how religion has engaged with politics after 1994.",
          "Give two examples.",
          "State the tension between religious freedom and political neutrality."
        ],
        solution: "Apartheid: the Dutch Reformed Church (NGK) provided theological justification for apartheid; the South African Council of Churches (SACC) and Desmond Tutu opposed it (liberation theology). Post-1994: the constitution guarantees freedom of religion and separates church and state. Example 1: many churches supported the Truth and Reconciliation Commission (TRC) as a process of healing — Archbishop Tutu chaired it. Example 2: the ACDP (African Christian Democratic Party) represents an explicitly Christian political agenda. Tension: the ANC and government reject religious interference in policy (abortion, same-sex marriage), while some churches claim a prophetic duty to challenge unjust laws.",
        commonErrors: [
          "Only describing the apartheid period, not post-1994.",
          "No examples.",
          "No discussion of the tension."
        ]
      },
      {
        question: "Discuss religion's role in addressing poverty in South Africa, with two concrete examples.",
        steps: [
          "State the theological/ethical motivation for addressing poverty.",
          "Example 1: faith-based organisation.",
          "Example 2: specific religious initiative.",
          "Critically evaluate: is religion sufficient?"
        ],
        solution: "Theological motivation: all major SA religions teach social justice. Islam: Zakat redistributes wealth. Christianity: 'the poor you will always have with you' — and prophetic tradition demands care for them. Examples: 1. Mustadafin Foundation (Cape Town Muslim charity): runs soup kitchens, distributes food parcels, operates a clinic. 2. Diakonia Council of Churches (Durban): provides legal aid, housing advocacy and poverty alleviation programmes across denominations. Critical evaluation: faith-based organisations fill gaps left by the state and are often more trusted in communities. However, religious poverty relief can be paternalistic and does not address structural causes (inequality, unemployment). State-level policy is essential alongside religious charity.",
        commonErrors: [
          "No specific examples.",
          "No critical evaluation.",
          "Describing religion as either entirely effective or entirely ineffective without nuance."
        ]
      },
      {
        question: "Explain the concept of gender equality in relation to religious teachings and give two examples of religious practices that limit women's roles.",
        steps: [
          "Define gender equality.",
          "Example 1 of limitation → religion → explanation.",
          "Example 2 of limitation → religion → explanation.",
          "State a counter-example of religion promoting gender equality."
        ],
        solution: "Gender equality: equal rights, responsibilities, and opportunities for all genders. Example 1: in many traditional Islamic interpretations, women cannot lead Friday Jumu'ah prayers in a mixed congregation — citing hadith tradition. Example 2: in Roman Catholic doctrine, women cannot be ordained as priests — the Church argues Christ chose male apostles; critics argue this perpetuates gender discrimination. Counter-example: the Methodist Church of Southern Africa ordains women as ministers and bishops; many liberal denominations affirm LGBTQ+ leadership. Conclusion: religion is neither monolithic nor static in its treatment of gender — there are progressive and conservative streams within every tradition.",
        commonErrors: [
          "Only one example.",
          "No counter-example.",
          "Treating all practitioners of a religion as holding the same position."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Ontleed die verwantskap tussen godsdiens en politiek in post-apartheid Suid-Afrika.",
        steps: [
          "Beskryf die rol van godsdiens tydens apartheid.",
          "Beskryf hoe godsdiens na 1994 met politiek betrokke raak.",
          "Gee twee voorbeelde.",
          "Stel die spanning tussen godsdienstige vryheid en politieke neutraliteit."
        ],
        solution: "Apartheid: NGK het teologiese regverdiging verskaf; SACC en Tutu het teengestaan. Post-1994: grondwet waarborg vryheid van godsdiens. Voorbeeld 1: kerke het WVK ondersteun. Voorbeeld 2: ACDP verteenwoordig 'n Christelike politieke agenda. Spanning: ANC verwerp godsdienstige inmenging; kerke beweer 'n profetiese plig.",
        commonErrors: [
          "Slegs die apartheid-tydperk beskryf.",
          "Geen voorbeelde nie.",
          "Geen bespreking van die spanning nie."
        ]
      },
      {
        question: "Bespreek godsdiens se rol in armoede-aanspreking in SA met twee konkrete voorbeelde.",
        steps: [
          "Stel die teologiese motivering.",
          "Voorbeeld 1: geloofsgebaseerde organisasie.",
          "Voorbeeld 2: spesifieke godsdienstige inisiatief.",
          "Evalueer krities."
        ],
        solution: "Motivering: alle groot SA-godsdienste leer sosiale geregtigheid. Voorbeelde: 1. Mustadafin Foundation (Kaapstad): soeprombas, voedselpakkies. 2. Diakonia (Durban): regsbystand en behuisingsadvokasie. Kritiese evaluasie: geloofsgebaseerde organisasies vul gapings; maar paternalisties en spreek nie strukturele oorsake aan nie.",
        commonErrors: [
          "Geen spesifieke voorbeelde nie.",
          "Geen kritiese evaluasie nie.",
          "Godsdiens as geheel doeltreffend of geheel ondoeltreffend beskryf."
        ]
      },
      {
        question: "Verduidelik geslagsgelykheid in verhouding tot godsdienstige leer en gee twee voorbeelde van godsdienstige praktyke wat vroue se rolle beperk.",
        steps: [
          "Definieer geslagsgelykheid.",
          "Voorbeeld 1 van beperking → godsdiens → verduideliking.",
          "Voorbeeld 2 van beperking → godsdiens → verduideliking.",
          "Stel 'n teenvoorbeeld van godsdiens wat geslagsgelykheid bevorder."
        ],
        solution: "Geslagsgelykheid: gelyke regte en geleenthede. Voorbeeld 1: tradisionele Islam-interpretasies verbied vroue om gemengde Jumu'ah-gebede te lei. Voorbeeld 2: Rooms-Katolieke doktrines teen vroulike ordening. Teenvoorbeeld: Metodiste Kerk van SA ordineer vroue as ministers. Gevolgtrekking: godsdiens is nie monolities nie.",
        commonErrors: [
          "Slegs een voorbeeld nie.",
          "Geen teenvoorbeeld nie.",
          "Alle praktisyns van 'n godsdiens as dieselfde posisie behandel."
        ]
      }
    ]
  },

  "RELI-5": {
    workedExamplesEn: [
      {
        question: "Describe the core beliefs of African Traditional Religion (ATR) focusing on the Supreme Being, ancestors and the living-dead.",
        steps: [
          "Supreme Being: describe the ATR concept.",
          "Ancestors (living-dead): define and explain their role.",
          "Relationship between the living and the living-dead.",
          "Give an example of ancestor veneration in practice."
        ],
        solution: "Supreme Being: most ATRs acknowledge a supreme, transcendent God (Nkulunkulu in Zulu, Modimo in Sotho) who created the universe but is often approached through intermediaries. Ancestors (living-dead — John Mbiti's term): the recently deceased who still maintain close links with the living community. They are not dead in the Western sense — they are in an active state, caring for their family if venerated properly. Relationship: the living honour the ancestors through rituals, libations and sacrifice; in return, the ancestors provide protection, fertility and guidance. Example: ukubuyisa (Zulu) — bringing the spirit of a recently deceased family member back home through a ritual meal shared by the community.",
        commonErrors: [
          "Describing ancestors as 'gods' — they are elevated humans, not deities.",
          "No example of practice.",
          "Confusing African Traditional Religion with a specific ethnic religion (ATR encompasses many traditions)."
        ]
      },
      {
        question: "Explain the role of a traditional healer (inyanga/sangoma) in a South African indigenous community.",
        steps: [
          "Define inyanga and sangoma and their roles.",
          "Explain the source of their healing power.",
          "Describe a healing practice.",
          "State the relationship to Western medicine."
        ],
        solution: "Inyanga: herbalist who uses plant medicines (muthi) to treat physical illness. Sangoma: diviner-healer who communicates with ancestors through possession (ukuthwasa — the calling), throwing bones, and dream interpretation to diagnose spiritual causes of illness. Healing power: derived from ancestors who call them to heal — the sangoma is a vessel for ancestral wisdom. Healing practice: throwing the bones (hakata) to determine the cause of illness; prescribing herbs; performing ritual cleansing ceremonies. Relationship to Western medicine: many South Africans use both systems — consulting a doctor AND a sangoma. The Department of Health recognises traditional healers; some hospitals have protocols for collaborative care.",
        commonErrors: [
          "Confusing inyanga (herbalist) with sangoma (diviner).",
          "Treating traditional healing as purely superstitious without respect for its cultural significance.",
          "No mention of the relationship to Western medicine."
        ]
      },
      {
        question: "Explain the significance of initiation rituals in South African indigenous traditions, using one specific example.",
        steps: [
          "Define initiation ritual.",
          "State its significance in ATR.",
          "Give one specific example.",
          "State challenges or controversies."
        ],
        solution: "Initiation: a rite of passage marking the transition from childhood to adulthood — the person 'dies' to their old identity and is 'reborn' as a responsible community member. Significance: integrates the individual into the community; transmits cultural values and knowledge; marks social status. Example: ulwaluko (Xhosa male initiation) — young men go to the bush, are circumcised by an ingcibi (circumcision surgeon), spend weeks in seclusion learning responsibility, then return as men at a ceremony with new clothes. Controversies: deaths have occurred due to botched circumcisions, infections and dehydration — the Eastern Cape government has regulated the practice; illegal mkhwetha (uninitiated) operations are prosecuted.",
        commonErrors: [
          "No specific example.",
          "No mention of controversies — the question expects critical engagement.",
          "Describing initiation only as 'circumcision' without the full rite of passage context."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Beskryf die kernoorltuigings van Afrika Tradisionele Godsdiens (ATG) met fokus op die Opperwese, voorouers en die lewend-gestorwenes.",
        steps: [
          "Opperwese: beskryf die ATG-konsep.",
          "Voorouers (lewend-gestorwenes): definieer en verduidelik hul rol.",
          "Verwantskap tussen die lewendes en lewend-gestorwenes.",
          "Gee 'n voorbeeld van voorouervering in praktyk."
        ],
        solution: "Opperwese: die meeste ATG's erken 'n opperste transendente God (Nkulunkulu in Zoeloe) wat gewoonlik deur tussengangers benader word. Voorouers (lewend-gestorwenes — John Mbiti): onlangs gestorwenes wat nog noue bande met die lewende gemeenskap behou. Verwantskap: lewendes vereer voorouers deur rituele; voorouers verskaf beskerming en leiding. Voorbeeld: ukubuyisa (Zoeloe) — bring die gees van 'n gestorwene na huis deur 'n rituele maaltyd.",
        commonErrors: [
          "Voorouers as 'gode' beskryf.",
          "Geen praktiese voorbeeld nie.",
          "ATG met 'n spesifieke etniese godsdiens verwar."
        ]
      },
      {
        question: "Verduidelik die rol van 'n tradisionele geneser (inyanga/sangoma) in 'n Suid-Afrikaanse inheemse gemeenskap.",
        steps: [
          "Definieer inyanga en sangoma en hul rolle.",
          "Verduidelik die bron van hul genesende krag.",
          "Beskryf 'n genesende praktyk.",
          "Stel die verwantskap met Westerse medisyne."
        ],
        solution: "Inyanga: kruiedokter wat plantmedisyne (muthi) gebruik. Sangoma: waarsêer-geneser wat met voorouers kommunikeer deur besitting (ukuthwasa), bene gooi en droominterpretasie. Genesende krag: afkomstig van voorouers. Praktyk: bene gooi; kruie voorskryf; rituele reiniging. Verhouding tot Westerse medisyne: baie SA-mense gebruik beide stelsels.",
        commonErrors: [
          "Inyanga (kruiedokter) met sangoma (waarsêer) verwar.",
          "Tradisionele genesing as suiwer bygeloof behandel.",
          "Geen vermelding van verhouding tot Westerse medisyne nie."
        ]
      },
      {
        question: "Verduidelik die betekenis van inisiasierituele in SA inheemse tradisies met een spesifieke voorbeeld.",
        steps: [
          "Definieer inisiasieritueel.",
          "Stel sy betekenis in ATG.",
          "Gee een spesifieke voorbeeld.",
          "Stel uitdagings of strydpunte."
        ],
        solution: "Inisiasie: 'n oorgangsrite wat die oorgang van kinderjare na volwassenheid merk. Betekenis: integreer die individu in die gemeenskap; dra kulturele waardes oor. Voorbeeld: ulwaluko (Xhosa manslike inisiasie) — jongmanne gaan na die bos, word besny deur 'n ingcibi, spandeer weke in afsondering. Strydpunte: sterftes weens mislukte besnydenis; die Oos-Kaap-regering het die praktyk gereguleer.",
        commonErrors: [
          "Geen spesifieke voorbeeld nie.",
          "Geen strydpunte nie.",
          "Inisiasie slegs as 'besnydenis' beskryf."
        ]
      }
    ]
  },

  // ===================== DRAMATIC ARTS (DRAMA) =====================

  "DRAMA-1": {
    workedExamplesEn: [
      {
        question: "Compare the theatrical conventions of Greek tragedy and Elizabethan drama in terms of structure, space and audience relationship.",
        steps: [
          "Greek tragedy: structure, space, audience.",
          "Elizabethan: structure, space, audience.",
          "Key similarities.",
          "Key differences."
        ],
        solution: "Greek tragedy: structure — five-act structure with episodes separated by choral odes; three actors (masked), Chorus of 15 comments on the action. Space: open-air amphitheatre (theatron), circular orchestra, raised skene as backdrop. Audience: large (15 000+), civic/religious event during the Festival of Dionysos. Elizabethan (Shakespeare's era): structure — five acts, subplot weaves into main plot; soliloquy for inner monologue; no Chorus (usually). Space: thrust stage (The Globe) — audience on three sides, minimal scenery. Audience: standing groundlings + seated galleries, rowdy and participatory. Similarities: both use poetic language; both explore fate, power and morality. Differences: Greek theatre used masks and Chorus; Elizabethan used actual character speech and more intimate staging.",
        commonErrors: [
          "Only one theatrical tradition described.",
          "No similarities identified.",
          "Confusing the Greek skene with the Elizabethan tiring house."
        ]
      },
      {
        question: "Explain Bertolt Brecht's concept of Verfremdungseffekt (alienation effect) and describe three techniques he used to achieve it.",
        steps: [
          "Define Verfremdungseffekt and its purpose.",
          "Technique 1 → effect.",
          "Technique 2 → effect.",
          "Technique 3 → effect."
        ],
        solution: "Verfremdungseffekt (V-Effekt/alienation effect): Brecht wanted audiences to think critically rather than empathise emotionally with characters. He 'alienated' (made strange) familiar situations so audiences could see them objectively and consider political change. Techniques: 1. Direct address — actors speak directly to the audience ('breaking the fourth wall'), reminding them they are watching a play, not reality. 2. Placards and signs — projected text announces what will happen before each scene, removing suspense and redirecting attention to HOW events unfold (not WHAT). 3. Visible staging — lights, props and scene changes are not hidden; the theatre machinery is exposed, reminding audiences of the constructed nature of the performance.",
        commonErrors: [
          "Confusing Brecht's approach with Stanislavski's method (they are opposites).",
          "Only naming techniques without explaining their effect.",
          "Describing the V-Effekt as making the audience feel uncomfortable — it aims to make them think."
        ]
      },
      {
        question: "Describe Jerzy Grotowski's concept of 'poor theatre' and explain how it differs from mainstream commercial theatre.",
        steps: [
          "Define poor theatre.",
          "List what is eliminated.",
          "Explain what remains.",
          "Compare to commercial theatre."
        ],
        solution: "Poor theatre (Grotowski, 1960s–70s, Poland): theatre stripped to its essential element — the actor-audience relationship. Everything 'extra' is eliminated. Eliminated: sets, elaborate costumes, lighting effects, makeup, recorded music, large casts. What remains: the actor's body, voice and presence; the audience in direct proximity. Comparison to commercial theatre: commercial theatre uses 'rich' production values (large casts, spectacular sets, lighting, sound) to create spectacle. Grotowski argued these elements distract from the actor's authentic, disciplined performance — the actor IS the production. The actor must undergo a via negativa — removing barriers to reveal authentic impulse.",
        commonErrors: [
          "Confusing 'poor' as low quality — 'poor' means reduced to essentials.",
          "No comparison to commercial theatre.",
          "Not mentioning the centrality of the actor's body and voice."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Vergelyk die teatrale konvensies van Griekse tragedie en Elisabethaanse drama in terme van struktuur, ruimte en gehoorverhouding.",
        steps: [
          "Griekse tragedie: struktuur, ruimte, gehoor.",
          "Elisabethaans: struktuur, ruimte, gehoor.",
          "Sleutelooreenkomste.",
          "Sleutelverskille."
        ],
        solution: "Griekse tragedie: struktuur — vyf episodes met koorsange tussenin. Ruimte: buitelugamfiteater (theatron), orkestra, skene. Gehoor: groot (15 000+), burgerlik/godsdienstig. Elisabethaans: struktuur — vyf bedrywe, ondertone; solilokwium. Ruimte: voortrekkerverhoog (The Globe). Gehoor: staande grondstaanders + sitbanke, rumoerig. Ooreenkomste: beide gebruik poeëtiese taal. Verskille: Griekse teater gebruik maskers; Elisabethaans gebruik werklike karakterspeech.",
        commonErrors: [
          "Slegs een teatertradisie beskryf.",
          "Geen ooreenkomste identifiseer nie.",
          "Griekse skene met Elisabethaanse kleedkamer verwar."
        ]
      },
      {
        question: "Verduidelik Bertolt Brecht se konsep van Verfremdungseffekt en beskryf drie tegnieke wat hy gebruik het.",
        steps: [
          "Definieer Verfremdungseffekt en sy doel.",
          "Tegniek 1 → effek.",
          "Tegniek 2 → effek.",
          "Tegniek 3 → effek."
        ],
        solution: "V-Effekt: Brecht wou gehore krities laat dink eerder as emosioneel identifiseer. Tegnieke: 1. Direkte toesprak — akteurs praat direk met die gehoor. 2. Plakkate en tekens — geprojecteerde teks kondig vooruit wat gaan gebeur. 3. Sigbare verhoogopstelling — ligte, rekwisiete en toneelomsettings is nie verberg nie.",
        commonErrors: [
          "Brecht se benadering met Stanislavski verwar.",
          "Tegnieke noem sonder die effek te verduidelik.",
          "V-Effekt as ongemaklik-maak beskryf — dit beoog om te laat dink."
        ]
      },
      {
        question: "Beskryf Jerzy Grotowski se konsep van 'arm teater' en verduidelik hoe dit van hoofstroom kommersiële teater verskil.",
        steps: [
          "Definieer arm teater.",
          "Lys wat geëlimineer word.",
          "Verduidelik wat oorbly.",
          "Vergelyk met kommersiële teater."
        ],
        solution: "Arm teater (Grotowski): teater gestrop tot sy noodsaaklike element — die akteur-gehoor verhouding. Geëlimineer: dekore, kostuums, ligte, musiek. Oorbly: die akteur se liggaam en stem. Vergelyking: kommersiële teater gebruik ryk produksiepagina's; Grotowski sê dit is afleiding. Die akteur IS die produksie.",
        commonErrors: [
          "'Arm' as lae gehalte verstaan.",
          "Geen vergelyking met kommersiële teater nie.",
          "Nie die akteur se liggaam en stem se sentraliteit noem nie."
        ]
      }
    ]
  },

  "DRAMA-2": {
    workedExamplesEn: [
      {
        question: "Explain Stanislavski's 'System' and describe three of its core techniques.",
        steps: [
          "Define the Stanislavski System and its goal.",
          "Technique 1 → explanation.",
          "Technique 2 → explanation.",
          "Technique 3 → explanation."
        ],
        solution: "Stanislavski's System: developed by Konstantin Stanislavski (1863–1938) — a method of actor training aimed at achieving truthful, believable character performance through psychological realism. Goal: the actor must 'live the part', not merely demonstrate it. Techniques: 1. Emotional Memory (Affective Memory): the actor recalls a personal emotional experience to authentically generate the emotion required in the scene. 2. The Magic If: the actor asks 'What would I do IF I were in this character's situation?' — replaces the character's reality with the actor's genuine impulse. 3. Objectives and Given Circumstances: every character in every scene has a specific objective (what they want) and acts within given circumstances (who, when, where, why) — the actor must know both to play truthfully.",
        commonErrors: [
          "Confusing Stanislavski with Brecht — Stanislavski seeks empathy; Brecht prevents it.",
          "Only naming techniques without explaining them.",
          "Describing 'method acting' (Lee Strasberg's adaptation) as identical to Stanislavski's original system."
        ]
      },
      {
        question: "Describe the process of character analysis as preparation for a role.",
        steps: [
          "Study the text: who is the character?",
          "Identify the character's super-objective.",
          "Identify scene-by-scene objectives.",
          "Analyse physical and vocal characteristics.",
          "Rehearse."
        ],
        solution: "1. Text study: read the entire play, not just your scenes — understand the world of the play, the character's history, relationships and status. 2. Super-objective: the character's overarching desire across the entire play (e.g. Hamlet's super-objective: to restore justice). 3. Scene objectives: in each scene, the character wants something specific — these build toward the super-objective. 4. Physical characteristics: how does this character walk, sit, gesticulate? (age, health, class, confidence). 5. Voice: pitch, pace, accent, volume — these reveal character. Rehearsal: integrate all choices into performance through repetition and feedback.",
        commonErrors: [
          "Only analysing the scenes in which the character appears.",
          "No mention of the super-objective.",
          "Treating physical and vocal choices as less important than emotional memory."
        ]
      },
      {
        question: "What is ensemble acting and describe two skills required to work effectively as an ensemble.",
        steps: [
          "Define ensemble acting.",
          "Skill 1 → explain.",
          "Skill 2 → explain.",
          "State why ensemble is important in SA community theatre."
        ],
        solution: "Ensemble: a group of actors who work collaboratively, sharing equal responsibility for the performance rather than having one star and supporting cast. Skill 1: Active listening — in ensemble work, actors must respond to each other in the moment, not anticipate. Active listening means genuinely hearing what another actor does in this performance (which may differ from yesterday) and responding truthfully. Skill 2: Trust and physical co-ordination — ensemble exercises (e.g. contact improvisation, mirroring, group sound-and-movement warm-ups) develop the ability to move together as a unit and take physical risks safely. SA community theatre importance: many South African township and protest theatre productions use ensemble structure — no single star, collective voice represents the community's experience (e.g. works by the Junction Avenue Theatre Company).",
        commonErrors: [
          "Treating ensemble as simply 'working in a group'.",
          "No skills described.",
          "No SA context given."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik Stanislavski se 'Stelsel' en beskryf drie van sy kerntegnieke.",
        steps: [
          "Definieer die Stanislavski-stelsel en sy doel.",
          "Tegniek 1 → verduideliking.",
          "Tegniek 2 → verduideliking.",
          "Tegniek 3 → verduideliking."
        ],
        solution: "Stanislavski-stelsel: akteursopleiding wat strewe na geloof-waardige karakteruitvoering deur sielkundige realisme. Doel: akteur moet 'die deel leef'. Tegnieke: 1. Emosionele Geheue: akteur onthou 'n persoonlike emosionele ervaring. 2. Die Magiese As: akteur vra 'Wat sou EK doen AS ek in hierdie karakter se situasie was?' 3. Doelwitte en Gegewe Omstandighede: elke karakter het 'n spesifieke doelwit en tree op binne gegewe omstandighede.",
        commonErrors: [
          "Stanislavski met Brecht verwar.",
          "Tegnieke noem sonder verduideliking.",
          "'Metode-akteerwerk' as identies aan Stanislavski se oorspronklike stelsel beskryf."
        ]
      },
      {
        question: "Beskryf die proses van karakterontleding as voorbereiding vir 'n rol.",
        steps: [
          "Teksontleding: wie is die karakter?",
          "Identifiseer die super-doelwit.",
          "Identifiseer toneel-vir-toneel-doelwitte.",
          "Ontleed fisiese en vokale eienskappe.",
          "Repeteer."
        ],
        solution: "1. Teksstudie: lees die hele toneelstuk. 2. Super-doelwit: die karakter se oorkoepelende begeerte (bv. Hamlet: geregtigheid herstel). 3. Toneel-doelwitte: in elke toneel wil die karakter iets spesifieks bereik. 4. Fisies: hoe loop, sit, gebaar hierdie karakter? 5. Stem: toonhoogte, tempo, aksent. Repetisie: integreer alle keuses.",
        commonErrors: [
          "Slegs die tonele ontleed waar die karakter verskyn.",
          "Geen vermelding van super-doelwit nie.",
          "Fisiese en vokale keuses as minder belangrik beskou."
        ]
      },
      {
        question: "Wat is ensemble-akteerwerk en beskryf twee vaardighede vir effektiewe ensemble-werk.",
        steps: [
          "Definieer ensemble-akteerwerk.",
          "Vaardigheid 1 → verduidelik.",
          "Vaardigheid 2 → verduidelik.",
          "Stel waarom ensemble belangrik is in SA gemeenskapsteater."
        ],
        solution: "Ensemble: akteurs werk samewerkerlik. Vaardigheid 1: Aktiewe luister — akteurs moet werklik hoor wat 'n ander akteur in hierdie opvoering doen. Vaardigheid 2: Vertroue en fisiese koördinasie — ensembleoefeninge ontwikkel die vermoë om saam te beweeg. SA gemeenskapsteater: protesteer-teater gebruik ensemblestruktuur — geen enkelstertakteur, kollektiewe stem.",
        commonErrors: [
          "Ensemble as bloot 'in 'n groep werk' behandel.",
          "Geen vaardighede beskryf nie.",
          "Geen SA-konteks nie."
        ]
      }
    ]
  },

  "DRAMA-3": {
    workedExamplesEn: [
      {
        question: "Explain the devising process and describe how a group might develop a performance piece on the theme of 'belonging'.",
        steps: [
          "Define devising.",
          "Phase 1: research and stimulus.",
          "Phase 2: exploration and improvisation.",
          "Phase 3: structuring and refining.",
          "Phase 4: performance."
        ],
        solution: "Devising: creating original theatre collaboratively, starting from a stimulus rather than a script. Belonging theme: Phase 1 — Research: group discusses personal experiences of belonging/exclusion; collects images, poems, songs, statistics about homelessness and migration. Stimulus: photograph of refugees at a border. Phase 2 — Improvisation: actors improvise scenes from different perspectives (refugee, border guard, local resident); try physical theatre (bodies as barriers and bridges). Phase 3 — Structure: select the most powerful scenes; arrange into a narrative arc (arrival → exclusion → attempted belonging → ambiguous resolution). Phase 4 — Add sound, light, costume choices; rehearse for consistency and polish.",
        commonErrors: [
          "Describing devising as simply 'making things up'.",
          "No phases of the process.",
          "No connection between the stimulus and the devised content."
        ]
      },
      {
        question: "Describe the elements of a well-structured dramatic script: exposition, rising action, climax, falling action, resolution.",
        steps: [
          "Define each element.",
          "Give an example from a known play for each."
        ],
        solution: "Exposition: introduction of characters, setting and situation — creates the world of the play. Example: the opening of Hamlet establishes the ghost's appearance and Hamlet's grief. Rising action: a series of events that increase conflict and tension. Example: Hamlet discovers his uncle murdered his father; tension escalates with each scene. Climax: the moment of highest tension — the turning point. Example: the play-within-a-play confirms Claudius's guilt. Falling action: consequences of the climax unfold. Example: Ophelia's madness and death, the duel preparations. Resolution: the conflict is resolved (tragically or comically). Example: the final duel — Hamlet kills Claudius but dies from poison.",
        commonErrors: [
          "Confusing climax with the ending — the climax is the turning point, not necessarily the last event.",
          "No examples from a play.",
          "Missing the falling action."
        ]
      },
      {
        question: "Write a brief two-character dramatic scene (100–120 words) showing conflict through subtext.",
        steps: [
          "Establish a situation with underlying tension.",
          "Characters say one thing but mean another (subtext).",
          "Conflict is present but not directly stated.",
          "Stage directions support subtext."
        ],
        solution: "SCENE: A kitchen. Evening. MOTHER washes dishes. SON enters. SON: You're still awake. MOTHER [without turning]: I was waiting for you to eat. SON: I already ate. MOTHER: Of course. [long pause] With your new friends. SON: Does it matter? MOTHER [finally turns]: No. [pause] Your father called. SON: What did he want? MOTHER: He wants to know you're okay. [She turns back to the dishes] I told him you were fine. [pause] I told him everything was fine. [Lights fade.] — Subtext: the mother is hurt by the son's absence; neither speaks directly about the real issue.",
        commonErrors: [
          "Having characters directly state the conflict ('I'm upset you weren't here').",
          "No stage directions to support subtext.",
          "Scene too long or too short."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die deviseeringsproses en beskryf hoe 'n groep 'n opvoering oor die tema 'behoort' kan ontwikkel.",
        steps: [
          "Definieer devising.",
          "Fase 1: navorsing en stimulus.",
          "Fase 2: verkenning en improvisasie.",
          "Fase 3: strukturering en verfyning.",
          "Fase 4: opvoering."
        ],
        solution: "Devising: oorspronklike teater skep samewerkerlik, begin met stimulus. Behoort-tema: Fase 1 — Navorsing: groep bespreek persoonlike ervarings; versamel beelde, gedigte. Stimulus: foto van vlugtelinge by 'n grens. Fase 2 — Improvisasie: akteurs improviseer uit verskillende perspektiewe. Fase 3 — Struktuur: kies die kragtigste tonele; rangskik in narratiewe boog. Fase 4 — Klank, lig, kostuum; repeteer.",
        commonErrors: [
          "Devising as bloot 'goed maak' beskryf.",
          "Geen prosessfases nie.",
          "Geen koppeling tussen stimulus en inhoud nie."
        ]
      },
      {
        question: "Beskryf die elemente van 'n goed gestruktureerde dramatiese teks: uiteensetting, stygende aksie, hoogtepunt, dalende aksie, oplossing.",
        steps: [
          "Definieer elke element.",
          "Gee 'n voorbeeld uit 'n bekende toneelstuk."
        ],
        solution: "Uiteensetting: karakters, omgewing en situasie — skep die wêreld van die toneelstuk. Voorbeeld: opening van Hamlet. Stygende aksie: toenemende konflik. Voorbeeld: Hamlet ontdek sy oom het sy vader vermoor. Hoogtepunt: hoogste spanning — keerpunt. Voorbeeld: toneelstuk-binne-toneelstuk. Dalende aksie: gevolge van hoogtepunt. Voorbeeld: Ophelia se kranksinnigheid. Oplossing: konflik opgelos. Voorbeeld: finale duel.",
        commonErrors: [
          "Hoogtepunt met die einde verwar.",
          "Geen voorbeelde uit 'n toneelstuk nie.",
          "Dalende aksie weglaat."
        ]
      },
      {
        question: "Skryf 'n kort twee-karaktertoneel (100–120 woorde) wat konflik deur subteks toon.",
        steps: [
          "Stel 'n situasie met onderliggende spanning.",
          "Karakters sê een ding maar bedoel 'n ander.",
          "Konflik aanwesig maar nie direk gestel nie.",
          "Verhoogaanwysings ondersteun subteks."
        ],
        solution: "TONEEL: Kombuis. Aand. MOEDER was skottelgoed. SEUN betree. SEUN: Jy is nog wakker. MOEDER [sonder om te draai]: Ek het gewag dat jy eet. SEUN: Ek het al geëet. MOEDER: Natuurlik. [lang pouse] Met jou nuwe vriende. SEUN: Maak dit saak? MOEDER [draai uiteindelik]: Nee. [pouse] Jou vader het gebel. [Sy draai terug na die skottelgoed] Ek het hom gesê jy is fine. [pouse] Ek het hom gesê alles is fine. [Ligte vervaag.] — Subteks: moeder is seergemaak deur seun se afwesigheid.",
        commonErrors: [
          "Karakters wat konflik direk stel.",
          "Geen verhoogaanwysings nie.",
          "Toneel te lank of te kort."
        ]
      }
    ]
  },

  "DRAMA-4": {
    workedExamplesEn: [
      {
        question: "Explain how a lighting designer uses the angle and colour of light to create mood in a theatre production.",
        steps: [
          "Angle of light → effect.",
          "Colour of light → effect.",
          "Give an example for each.",
          "State the collaboration between director and lighting designer."
        ],
        solution: "Angle: Front light (from front-of-house) — reveals faces, naturalistic. Side light (90°) — sculpts the body, creates dramatic shadows, used in dance and physical theatre. Top/downlight — creates isolation, can be eerie or divine. Under-light (footlights) — creates horror/sinister effect (shadow thrown upward on face). Colour: warm (amber, red) — intimacy, passion, danger. Cool (blue, green) — coldness, mystery, death, moonlight. Neutral (white/UV) — naturalistic or clinical. Example: a red wash during a rage/murder scene intensifies emotion; a cold blue for a ghost scene creates unease. Collaboration: the lighting designer reads the script with the director, attends rehearsals, creates a cue sheet that integrates with sound and set.",
        commonErrors: [
          "Confusing angle and intensity.",
          "No colour examples.",
          "No mention of director-designer collaboration."
        ]
      },
      {
        question: "Describe the role of the stage manager in a theatre production.",
        steps: [
          "Pre-production responsibilities.",
          "Rehearsal responsibilities.",
          "Performance (show) responsibilities.",
          "State why the stage manager is essential."
        ],
        solution: "Pre-production: coordinates schedules; prepares the prompt book (master copy of the script with all cues, blocking and notes); liaises between director and all departments. Rehearsal: calls actors; tracks blocking in the prompt book; manages the rehearsal schedule; stands in for absent actors. Performance: 'calls the show' — gives go cues to lighting, sound and fly operators via headset; manages backstage flow; solves problems in real time. Essential: the stage manager is the nerve centre of the production — without them, cues are missed, actors are late and the director's vision cannot be reliably reproduced.",
        commonErrors: [
          "Confusing stage manager with the director.",
          "No description of performance responsibilities.",
          "Not mentioning the prompt book."
        ]
      },
      {
        question: "Explain three elements of costume design and how each contributes to character revelation.",
        steps: [
          "Element 1 → character revelation.",
          "Element 2 → character revelation.",
          "Element 3 → character revelation."
        ],
        solution: "1. Colour: costume colour communicates character personality immediately. Example: a character always dressed in black may signal authority, grief, or villainy; a character in bright yellow signals optimism and naivety. 2. Silhouette/Shape: the outline of the costume (wide skirt vs tight trousers vs oversized jacket) signals time period, gender expression, status and body relationship. Example: a corseted silhouette signals Victorian social constraint; a loose, shapeless garment signals poverty or freedom. 3. Texture/Fabric: rough, coarse fabric (burlap, wool) suggests poverty or hardship; smooth, shiny fabric (silk, satin) suggests wealth and status. Example: a factory worker's rough overalls vs a manager's smooth suit — the contrast of textures signals the class divide.",
        commonErrors: [
          "Only one element given.",
          "No character revelation explained — listing elements alone is insufficient.",
          "Confusing costume design with wardrobe management."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik hoe 'n beligtingsontwerper die hoek en kleur van lig gebruik om stemming te skep.",
        steps: [
          "Hoek van lig → effek.",
          "Kleur van lig → effek.",
          "Gee 'n voorbeeld vir elk.",
          "Stel samewerking tussen regisseur en beligtingsontwerper."
        ],
        solution: "Hoek: Voorlig — onthul gesigte, naturalisties. Syeligte (90°) — skilder die liggaam. Bolig — isolasie. Onderlig — griesel. Kleur: Warm (amber) — intimiteit. Koel (blou) — koue, dood. Voorbeeld: rooi was tydens moord; koel blou vir spooktoneel. Samewerking: ontwerper lees teks, woon repetisies by, skep cue-vel.",
        commonErrors: [
          "Hoek en intensiteit verwar.",
          "Geen kleur-voorbeelde nie.",
          "Geen vermelding van regisseur-ontwerper samewerking nie."
        ]
      },
      {
        question: "Beskryf die rol van die verhoogbestuurder in 'n teaterproduskie.",
        steps: [
          "Voor-produksie verantwoordelikhede.",
          "Repetisie verantwoordelikhede.",
          "Opvoering verantwoordelikhede.",
          "Stel waarom die verhoogbestuurder noodsaaklik is."
        ],
        solution: "Voor-produksie: koördineer skedules; berei die promptboek voor. Repetisie: roep akteurs; volg blokkeringin promptboek. Opvoering: gee go-tekens aan belygtings, klank via oorstuk; los probleme op. Noodsaaklik: sonder hulle word tekens gemis en die regisseur se visie word nie herhaalbaar voortgesit nie.",
        commonErrors: [
          "Verhoogbestuurder met regisseur verwar.",
          "Geen opvoering verantwoordelikhede nie.",
          "Promptboek nie noem nie."
        ]
      },
      {
        question: "Verduidelik drie elemente van kostuum-ontwerp en hoe elkeen tot karakteronthulling bydra.",
        steps: [
          "Element 1 → karakteronthulling.",
          "Element 2 → karakteronthulling.",
          "Element 3 → karakteronthulling."
        ],
        solution: "1. Kleur: kostuum kleur kommunikeer persoonlikheid onmiddellik. Voorbeeld: swart = gesag; geel = optimisme. 2. Silhoeëet/Vorm: die omtrek toon tydperk, geslag en statusverhouding. Voorbeeld: korsetssilhoeëet = Victoriaanse beperking. 3. Tekstuur/Stof: growwe stof = armoede; gladde sy = rykdom. Voorbeeld: arbeider se growwe oorpak vs bestuurder se gladde pak.",
        commonErrors: [
          "Slegs een element gee.",
          "Geen karakteronthulling verduidelik nie.",
          "Kostuum-ontwerp met garderobe-bestuur verwar."
        ]
      }
    ]
  },

  "DRAMA-5": {
    workedExamplesEn: [
      {
        question: "Describe the characteristics of protest theatre in apartheid South Africa and give a named example.",
        steps: [
          "Define protest theatre.",
          "List 3 characteristics.",
          "Name a specific production.",
          "Explain its impact."
        ],
        solution: "Protest theatre: theatrical work created to expose, resist and challenge the apartheid regime — often performed in township halls, community centres and church basements (not commercial theatres). Characteristics: 1. Collective creation — devised by the company without a single author. 2. Topical, politically urgent content drawn from real township experience. 3. Simple staging (few resources) with powerful physical and vocal performance. Named production: 'Woza Albert!' (1981) by Percy Mtwa, Mbongeni Ngema, Barney Simon — imagines what would happen if Jesus returned to apartheid South Africa. Impact: performed internationally; exposed global audiences to the absurdity of apartheid; gave township performers a platform on the world stage.",
        commonErrors: [
          "No named production.",
          "Characteristics listed without explanation.",
          "Confusing protest theatre with township theatre (all protest theatre was not township theatre, and vice versa)."
        ]
      },
      {
        question: "Discuss the concept of 'post-apartheid identity' in South African drama after 1994, with reference to one play.",
        steps: [
          "Define post-apartheid identity as a theme.",
          "Describe the challenges of building identity post-1994.",
          "Name and describe one play that explores this.",
          "State what the play says about SA identity."
        ],
        solution: "Post-apartheid identity: after 1994, South African theatre grappled with who 'we' are now — the rainbow nation ideal vs persistent inequality, language, race, memory and land. Challenges: the wounds of apartheid don't disappear with a new government; reconciliation is more complex than the TRC suggested. Play: 'The Island' by Athol Fugard, John Kani and Winston Ntshona (1973, but continues to resonate) — two prisoners on Robben Island rehearse Antigone for a prison concert. What it says: justice requires personal sacrifice; oppression cannot silence the human spirit; SA identity is forged in resistance and dignity. Post-1994: new plays like Lara Foot's 'Tshepang' explore how apartheid's legacy continues to damage communities through gender violence.",
        commonErrors: [
          "Describing only the apartheid era without the post-1994 shift.",
          "No play referenced.",
          "Treating 'rainbow nation' as an unproblematic reality."
        ]
      },
      {
        question: "Explain what physical theatre is and describe how it is used in contemporary South African performance.",
        steps: [
          "Define physical theatre.",
          "Describe key techniques.",
          "Give a SA example.",
          "State why it suits the SA performance context."
        ],
        solution: "Physical theatre: a performance style that privileges the body as the primary storytelling instrument, often de-emphasising text. The actor's movement, gesture, and physical relationship to space and other actors carry meaning. Key techniques: ensemble movement in unison or counterpoint; use of levels (floor, mid-height, elevated); slow motion and repetition; contact and weight-sharing; rhythmic sound produced by the body. SA example: Brett Bailey's 'Big Dada' and the work of Handspring Puppet Company use physical and object theatre to tell South African stories about power and identity. Suits SA: physical theatre transcends language barriers — in a multilingual country with 11 official languages, the body communicates beyond the verbal.",
        commonErrors: [
          "Describing physical theatre as simply 'acting that uses movement'.",
          "No SA example.",
          "No explanation of why it suits the SA context."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Beskryf die eienskappe van protesteer-teater in apartheid Suid-Afrika en gee 'n genoemde voorbeeld.",
        steps: [
          "Definieer protesteer-teater.",
          "Lys 3 eienskappe.",
          "Noem 'n spesifieke produksie.",
          "Verduidelik sy impak."
        ],
        solution: "Protesteer-teater: teatrale werk om die apartheidsregime bloot te stel. Eienskappe: 1. Kollektiewe skepping. 2. Politiese inhoud uit werklike dorpservaring. 3. Eenvoudige verhoogopstelling. Produksie: 'Woza Albert!' (1981) — verbeel Jesus wat na apartheid SA terugkeer. Impak: internasionaal opgevoer; wêreldgehoor blootgestel aan apartheid.",
        commonErrors: [
          "Geen genoemde produksie nie.",
          "Eienskappe sonder verduideliking lys.",
          "Protesteer-teater met dorpsteater verwar."
        ]
      },
      {
        question: "Bespreek die konsep van 'post-apartheid identiteit' in SA-drama na 1994 met verwysing na een toneelstuk.",
        steps: [
          "Definieer post-apartheid identiteit as tema.",
          "Beskryf uitdagings van identiteitsbou na 1994.",
          "Noem en beskryf een toneelstuk.",
          "Stel wat die toneelstuk oor SA-identiteit sê."
        ],
        solution: "Post-apartheid identiteit: na 1994 het SA teater geworstel met wie 'ons' nou is. Uitdagings: apartheid se wonde verdwyn nie met 'n nuwe regering nie. Toneelstuk: 'The Island' (Fugard, Kani, Ntshona) — twee gevangenes op Robbeneiland. Wat dit sê: geregtigheid vereis opoffering; unterdrukking kan nie die menslike gees stilmaak nie. Post-1994: 'Tshepang' verken hoe apartheid se nalatenskap gemeenskappe beseer.",
        commonErrors: [
          "Slegs die apartheid-tydperk beskryf.",
          "Geen toneelstuk verwys nie.",
          "'Reënboognasie' as problematielose werklikheid behandel."
        ]
      },
      {
        question: "Verduidelik wat fisiese teater is en beskryf hoe dit in kontemporêre SA-uitvoering gebruik word.",
        steps: [
          "Definieer fisiese teater.",
          "Beskryf sleuteltegnieke.",
          "Gee 'n SA-voorbeeld.",
          "Stel waarom dit vir die SA-uitvoering konteks geskik is."
        ],
        solution: "Fisiese teater: uitvoeringsstyl wat die liggaam as primêre vertellingsinstrument bevoordeel. Sleuteltegnieke: ensemble-beweging; gebruik van vlakke; stadige beweging; kontak en gewig-deling. SA-voorbeeld: Handspring Pop Company gebruik fisiese en voorwerp-teater. Geskiktheid: fisiese teater oorstyg taalgrense in 'n meertalige land.",
        commonErrors: [
          "Fisiese teater as bloot 'aksie wat beweging gebruik' beskryf.",
          "Geen SA-voorbeeld nie.",
          "Geen verduideliking waarom dit geskik is nie."
        ]
      }
    ]
  },

  // ===================== DANCE STUDIES (DANCE) =====================

  "DANCE-1": {
    workedExamplesEn: [
      {
        question: "Describe three forms of South African indigenous dance and the cultural context of each.",
        steps: [
          "Form 1 → cultural context.",
          "Form 2 → cultural context.",
          "Form 3 → cultural context."
        ],
        solution: "1. Indlamu (Zulu/Ndebele): a vigorous, high-stepping warrior dance performed in regalia with shields and sticks; rooted in the celebration of Zulu military culture and performed at ceremonies and celebrations. 2. Gumboot dance: originated among Zulu mineworkers in the late 19th century — miners who were forbidden to communicate developed a language of stomping, slapping gumboots and clicking safety pins. Today performed as entertainment and cultural expression. 3. Langarm (Cape Malay influenced): a social couple-dance combining European ballroom and Cape Malay influences, performed at Cape community celebrations — reflects the multicultural heritage of the Western Cape.",
        commonErrors: [
          "Only one form described.",
          "No cultural context — naming alone earns partial marks.",
          "Confusing Gumboot dance (labour origin) with Indlamu (warrior tradition)."
        ]
      },
      {
        question: "Explain the role of dance in a traditional South African community ceremony (rite of passage).",
        steps: [
          "Name the ceremony.",
          "Describe the dance performed.",
          "Explain its symbolic function.",
          "State who performs it and who observes."
        ],
        solution: "Ceremony: Xhosa ulwaluko (male initiation). Dance: initiates (abakhwetha) and male elders perform disciplined, rhythmic dance as part of the closing ceremony marking the return of the newly initiated men to the community. Symbolic function: the dance publicly declares the transformation — the boy is gone, the man has arrived; the community witnesses and affirms the new status. Performance: the newly initiated men dance in new white clothing (amabhayi) with elders — women observe from a respectful distance in traditional protocol. The dance is inseparable from the community's acceptance of the new men.",
        commonErrors: [
          "Not specifying a particular community or ceremony.",
          "Describing dance without its symbolic function.",
          "No mention of who performs vs who observes."
        ]
      },
      {
        question: "Compare the functions of dance in pre-colonial and contemporary South African societies.",
        steps: [
          "Pre-colonial functions.",
          "Contemporary functions.",
          "What has changed.",
          "What has persisted."
        ],
        solution: "Pre-colonial: dance was primarily functional — rituals for rainmaking, healing, war preparation, rites of passage and ancestor communication. Dance was communal and inseparable from spiritual and social life. Contemporary: dance serves entertainment, competition (e.g. step competitions), identity assertion (e.g. performing indigenous dance for international audiences), education and tourism. What changed: dance has been commodified and decontextualised — performed for audiences outside its original community. What persisted: dance continues to mark rites of passage; it remains central to identity expression, especially among urban South Africans reconnecting with indigenous roots.",
        commonErrors: [
          "Only contemporary functions.",
          "No discussion of what has changed or persisted.",
          "Treating pre-colonial dance as primitive or unsophisticated."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Beskryf drie vorms van Suid-Afrikaanse inheemse dans en die kulturele konteks van elk.",
        steps: [
          "Vorm 1 → kulturele konteks.",
          "Vorm 2 → kulturele konteks.",
          "Vorm 3 → kulturele konteks."
        ],
        solution: "1. Indlamu (Zoeloe/Ndebele): kragtige, hoëtrappende krygerdans in regalia; gewortel in Zoeloemilitêre kultuur. 2. Rubberlaarsdans: ontstaan onder Zoeloe-mynwerkers in die laat 19de eeu — werkers wat verbied is om te kommunikeer het 'n taal van stampende gumbootslange ontwikkel. 3. Langarm (Kaapse Maleisiche invloed): sosiale paardans met Europese ballroom en Kaapse Maleisice invloede.",
        commonErrors: [
          "Slegs een vorm beskryf.",
          "Geen kulturele konteks nie.",
          "Rubberlaarsdans met Indlamu verwar."
        ]
      },
      {
        question: "Verduidelik die rol van dans in 'n tradisionele SA gemeenskapsseremonie.",
        steps: [
          "Noem die seremonie.",
          "Beskryf die dans.",
          "Verduidelik sy simboliese funksie.",
          "Stel wie dans en wie waarneem."
        ],
        solution: "Seremonie: Xhosa ulwaluko. Dans: nuutgeinitieerde mans en ouer mans dans gedissiplineerd. Simboliese funksie: die dans verklaar die transformasie openlik. Uitvoering: nuutgeinitieerdes dans in wit klere; vroue neem waar.",
        commonErrors: [
          "Nie 'n spesifieke gemeenskap of seremonie spesifiseer nie.",
          "Dans sonder simboliese funksie beskryf.",
          "Geen vermelding van wie dans vs wie waarneem nie."
        ]
      },
      {
        question: "Vergelyk die funksies van dans in pre-koloniale en kontemporêre SA samelewings.",
        steps: [
          "Pre-koloniale funksies.",
          "Kontemporêre funksies.",
          "Wat verander het.",
          "Wat volgehou het."
        ],
        solution: "Pre-koloniaal: dans was hoofsaaklik funksioneel — rituele vir reënmaak, genesing, oorlogvoorbereiding. Kontemporêr: vermaak, kompetisie, identiteitsbevestiging, onderwys, toerisme. Verander: dans is kommodifiseer. Volgehou: dans merk steeds oorgangsrites.",
        commonErrors: [
          "Slegs kontemporêre funksies.",
          "Geen bespreking van wat verander het nie.",
          "Pre-koloniale dans as primitief behandel."
        ]
      }
    ]
  },

  "DANCE-2": {
    workedExamplesEn: [
      {
        question: "Analyse a dance using Rudolf Laban's movement analysis framework (Effort, Space, Body, Shape).",
        steps: [
          "Effort (Weight, Time, Flow, Space).",
          "Space (level, direction, pathway).",
          "Body (which body parts, sequences).",
          "Shape (how the body shapes itself and relates to others)."
        ],
        solution: "Dance: a solo contemporary piece. Effort: Weight — alternates between strong (firm, pressing into the floor) and light (floating, buoyant); Time — sudden sharp movements contrast with sustained lyrical phrases; Flow — combination of bound (controlled, restrained) and free flow (abandoned, released). Space: uses all three levels (floor, standing, elevated in jumps); diagonal pathways predominate. Body: the spine is used as an expressive instrument — rippling, contracting, arching; feet and hands articulate distinctly. Shape: body alternates between closed (curved inward, defensive) and open (expansive, reaching outward) shapes; relationship to the floor is intimate.",
        commonErrors: [
          "Only describing Effort without the other three categories.",
          "No dance specified — generic descriptions are not analyses.",
          "Confusing Laban's Effort actions with movements (e.g. 'she runs' is a movement, not an Effort quality)."
        ]
      },
      {
        question: "Explain the concept of 'kinesphere' (Laban) and describe how a dancer can use their kinesphere expressively.",
        steps: [
          "Define kinesphere.",
          "Describe the three ranges of kinesphere.",
          "Explain expressive use.",
          "Give an example."
        ],
        solution: "Kinesphere: the personal movement space surrounding a dancer's body — all the space the dancer can reach without travelling (like a bubble). Three ranges: Near space (small gestures, close to the body — introversion); Middle space; Far reach space (full extension of limbs — extroversion). Expressive use: a dancer who stays in near space projects intimacy, fear or containment. A dancer who explodes into far reach space projects confidence, joy or aggression. Example: a dancer processing grief might begin contracted in near space, then gradually expand outward as emotional release arrives — the kinesphere maps the emotional journey.",
        commonErrors: [
          "Defining kinesphere as simply 'personal space'.",
          "No description of the three ranges.",
          "No expressive example."
        ]
      },
      {
        question: "Describe the relationship between music and movement in African traditional dance.",
        steps: [
          "Explain how rhythm structures movement.",
          "Describe call-and-response between dancer and musician.",
          "Give an example.",
          "Compare to Western ballet's relationship with music."
        ],
        solution: "African traditional dance: rhythm is the organising principle — movement is generated by and responsive to the drum. Complex polyrhythmic patterns allow different body parts to respond to different rhythmic layers simultaneously (e.g. feet follow the bass drum; arms the shaker). Call-and-response: a lead drummer can change rhythm to signal a direction change or increase energy — dancers respond immediately, creating a live conversation. Example: in Agbadza (West African Ewe tradition), the bell pattern is constant, while the master drum improvises within the phrase structure, and dancers respond to improvisational cues. Comparison to ballet: in ballet, the choreography is typically set to a fixed score — dancers follow the musical structure rigidly. In traditional African dance, the relationship is more improvisational and interactive.",
        commonErrors: [
          "Only describing Western music-movement relationships.",
          "No specific example from a named tradition.",
          "No comparison."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Ontleed 'n dans deur Rudolf Laban se bewegingontledingsraamwerk (Inspanning, Ruimte, Liggaam, Vorm).",
        steps: [
          "Inspanning (Gewig, Tyd, Vloei, Ruimte).",
          "Ruimte (vlak, rigting, pad).",
          "Liggaam (watter liggaamsdele, reekse).",
          "Vorm (hoe die liggaam homself vorm)."
        ],
        solution: "Dans: 'n solo kontemporêre stuk. Inspanning: Gewig — wissel tussen sterk en lig; Tyd — skielike skerp bewegings kontrasteer met volgehoue liriese frases. Ruimte: gebruik alle drie vlakke. Liggaam: ruggraat as uitdrukkingsinstrument. Vorm: liggaam wissel tussen geslote (krom) en oop (uitbreidend).",
        commonErrors: [
          "Slegs Inspanning beskryf.",
          "Geen spesifieke dans nie.",
          "Laban se Inspanningsaksies met bewegings verwar."
        ]
      },
      {
        question: "Verduidelik die konsep van 'kinesfeer' (Laban) en beskryf hoe 'n danser sy kinesfeer uitdruklik kan gebruik.",
        steps: [
          "Definieer kinesfeer.",
          "Beskryf die drie reikafstande.",
          "Verduidelik uitdrukkingsgebruik.",
          "Gee 'n voorbeeld."
        ],
        solution: "Kinesfeer: die persoonlike bewegingsruimte rondom 'n danser — alle ruimte bereikbaar sonder om te beweeg. Drie reikafstande: Nabery, Middelberry, Ver-bereikery. Uitdrukkingsgebruik: danser in nabery-ruimte projekteer intimiteit of vrees; ver-bereik projekteer vreugde. Voorbeeld: danser wat droefheid verwerk begin gekontrakteerd, dan vergroot geleidelik.",
        commonErrors: [
          "Kinesfeer as bloot 'persoonlike ruimte' definieer.",
          "Geen drie reikafstande nie.",
          "Geen uitdrukkingsvoorbeeld nie."
        ]
      },
      {
        question: "Beskryf die verwantskap tussen musiek en beweging in Afrika tradisionele dans.",
        steps: [
          "Verduidelik hoe ritme beweging struktureer.",
          "Beskryf roep-en-antwoord tussen danser en musikant.",
          "Gee 'n voorbeeld.",
          "Vergelyk met Westerse ballet se verwantskap met musiek."
        ],
        solution: "Afrika tradisionele dans: ritme is die organiserende beginsel. Poliritmie laat verskillende liggaamsdele reageer op verskillende ritimiese lae. Roep-en-antwoord: 'n leidende tromspeler kan ritme verander — dansers reageer onmiddellik. Voorbeeld: in Agbadza (Ewe) is die klokkpatroon konstant terwyl die meestertrom improviseer. Vergelyking: in ballet volg choreografie 'n vaste partituur; in tradisionele Afrika dans is die verhouding meer improvisasioneel.",
        commonErrors: [
          "Slegs Westerse musiek-bewegingsverwantskappe beskryf.",
          "Geen spesifieke voorbeeld nie.",
          "Geen vergelyking nie."
        ]
      }
    ]
  },

  "DANCE-3": {
    workedExamplesEn: [
      {
        question: "Describe the five positions of the feet in ballet and explain their function in barre work.",
        steps: [
          "Position 1 → description.",
          "Position 2 → description.",
          "Position 3 → description.",
          "Position 4 → description.",
          "Position 5 → description.",
          "State the function in barre work."
        ],
        solution: "1st: heels together, toes turned out to 180° (ideal); 2nd: feet apart (width of one foot), both turned out; 3rd: one foot placed in front of the other, heels touching the middle of the other foot); 4th: one foot in front, gap between feet (shoulder-width), both turned out; 5th: front foot heel placed at toe of back foot, fully turned out. Barre work builds strength, alignment, and muscle memory for centre work.",
        commonErrors: [
          "Confusing 3rd and 5th position — in 5th the heel meets the toe, not just touching midway.",
          "Failing to state the function of barre work (strength, alignment, muscle memory).",
          "Writing 'heels touching' for 4th position — 4th has a gap between feet.",
          "Omitting that turnout should be natural (not forced to 180° for beginners)."
        ]
      },
      {
        question: "Describe how a choreographer uses space (levels, directions, pathways) to create visual interest in a dance work.",
        steps: [
          "Define 'space' as a choreographic element.",
          "List the three components: levels (high/mid/low), directions (forward/back/sideways/diagonal), pathways (straight/curved/zigzag on the floor or through the air).",
          "Explain how changing levels creates contrast and visual surprise.",
          "Explain how varied directions and pathways prevent monotony and guide the audience's eye.",
          "Link spatial choices to intention/meaning."
        ],
        solution: "Space is the area in which dancers move. Levels (high — jumps/lifts; mid — standing; low — floor work) create visual contrast. Directions (forward, backward, sideways, diagonal) and pathways (straight lines suggest purpose; curves suggest fluidity; zigzag suggests tension) vary the visual landscape. A choreographer combining all three keeps the audience engaged and uses spatial design to reinforce the dance's emotional or narrative intention.",
        commonErrors: [
          "Listing levels without explaining their visual/emotional effect.",
          "Confusing floor pathway with air pathway.",
          "Failing to link spatial choices to choreographic intention.",
          "Only discussing one component of space instead of all three."
        ]
      },
      {
        question: "Explain the concept of 'time' as a choreographic element and discuss how tempo, rhythm, and duration shape a dance work.",
        steps: [
          "Define 'time' as a choreographic element.",
          "Explain tempo and its expressive effect (fast vs slow).",
          "Explain rhythm (pattern of accents) and its types (metric, poly-rhythmic).",
          "Explain duration (how long a movement is held or sustained).",
          "Describe how varying these aspects changes the energy and emotional tone of a dance."
        ],
        solution: "Time refers to when and for how long movements occur. Tempo (speed): fast tempo generates excitement and urgency; slow tempo creates lyricism, tension, or weight. Rhythm (pattern of accents): metric rhythm aligns with the music's beat structure; poly-rhythmic movement works against the beat to create tension. Duration: short, sharp movements create contrast and punctuation; long, sustained movements create flowing, connected phrases. Together these temporal aspects determine the energy level and emotional tone — a passage of sustained slow movement can communicate grief or reflection, while rapid staccato rhythms can convey panic or joy depending on context.",
        commonErrors: [
          "Confusing tempo (speed) with rhythm (pattern of accents).",
          "Omitting duration as a separate aspect.",
          "Failing to give examples of how temporal changes affect a dance's character.",
          "Writing only about musical notes rather than about the dancer's movement timing."
        ]
      },
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die konsep van 'tyd' as 'n choreografiese element en bespreek hoe tempo, ritme en duur dans beïnvloed.",
        steps: [
          "Definieer 'tyd' as 'n choreografiese element.",
          "Bespreek tempo (spoed van beweging).",
          "Bespreek ritme (patroon van aksentuation).",
          "Bespreek duur (hoe lank 'n beweging duur).",
          "Gee voorbeelde van hoe hierdie aspekte die dans se karakter verander."
        ],
        solution: "Tyd verwys na wanneer en hoe lank bewegings plaasvind. Tempo (spoed) kan 'n dans kragtig of kwesbaar maak — vinnig skep opwinding, stadig skep spanning of liriese kwaliteit. Ritme (patroon van aksente) gee struktuur en kan metriek (met musiek) of poliritmiese (teen musiek) wees. Duur — kort bewegings skep skerp kontras; lang bewegings skep vloeiende frases. Saam bepaal hierdie aspekte die energievlak en emosionele toon van die dans.",
        commonErrors: [
          "Verwar tempo met ritme — tempo is spoed, ritme is patroon.",
          "Vergeet om duur as 'n afsonderlike aspek te bespreek.",
          "Gee geen voorbeelde van hoe tydveranderinge die dans se karakter beïnvloed nie.",
          "Skryf slegs oor musieknote in plaas van dansbeweging."
        ]
      },
      {
        question: "Beskryf die vyf posisies van die voete in ballet en verduidelik hul funksie in barre-werk.",
        steps: [
          "Posisie 1 → hiele saam, tone uitgedraai.",
          "Posisie 2 → voete uitmekaar, beide uitgedraai.",
          "Posisie 3 → een voet voor, hiel raak middel van ander voet.",
          "Posisie 4 → een voet voor, spasie tussen voete, beide uitgedraai.",
          "Posisie 5 → hiel van voorste voet teen toon van agterste voet.",
          "Verduidelik die funksie van barre-werk."
        ],
        solution: "1ste: hiele saam, tone uitgedraai na 180° (ideaal); 2de: voete uitmekaar (breedte van een voet), beide uitgedraai; 3de: een voet voor die ander, hiel raak middel van ander voet; 4de: een voet voor, spasie tussen voete (skouerbreedte), beide uitgedraai; 5de: hiel van voorste voet geplaas teen toon van agterste voet, volledig uitgedraai. Barre-werk bou sterkte, uitlijning, en spiergeheue vir sentrum-werk.",
        commonErrors: [
          "Verwar 3de en 5de posisie — in 5de raak die hiel die toon, nie net die middel nie.",
          "Vergeet om die funksie van barre-werk te noem (sterkte, uitlijning, spiergeheue).",
          "Skryf 'hiele raak mekaar' vir 4de posisie — 4de het 'n spasie tussen voete.",
          "Laat na dat uitdraai natuurlik moet wees (nie geforseerd na 180° vir beginners nie)."
        ]
      },
      {
        question: "Verduidelik hoe 'n choreograaf ruimte (vlakke, rigtings, paaie) gebruik om visuele belangstelling in 'n danswerk te skep.",
        steps: [
          "Definieer 'ruimte' as 'n choreografiese element.",
          "Lys die drie komponente: vlakke (hoog/middel/laag), rigtings (voor/agter/sywaarts/diagonaal), paaie (reguit/geboë/sigsag op die vloer of deur die lug).",
          "Verduidelik hoe vlakverandering kontras en visuele verrassing skep.",
          "Verduidelik hoe gevarieerde rigtings en paaie eentonigheid voorkom.",
          "Verbind ruimtelike keuses aan intensie/betekenis."
        ],
        solution: "Ruimte is die gebied waarbinne dansers beweeg. Vlakke (hoog — spronge/lifte; middel — staande; laag — vloerwerk) skep visuele kontras. Rigtings (voor, agter, sywaarts, diagonaal) en paaie (reguit lyne dui doelgerigtheid aan; kurwes dui vloeibaarheid aan; sigsag dui spanning aan) varieer die visuele landskap. 'n Choreograaf wat al drie kombineer, hou die gehoor betrokke en gebruik ruimtelike ontwerp om die emosionele of narratiewe intensie te versterk.",
        commonErrors: [
          "Lys vlakke sonder om hul visuele/emosionele effek te verduidelik.",
          "Verwar vloerpad met lugpad.",
          "Versuim om ruimtelike keuses aan choreografiese intensie te verbind.",
          "Bespreek slegs een komponent van ruimte in plaas van al drie."
        ]
      }
    ]
  },
  "DANCE-4": {
    workedExamplesEn: [
      {
        question: "Analyse the relationship between music and movement in a named dance style of your choice.",
        steps: [
          "Name the dance style and briefly describe it.",
          "Explain how movement responds to musical rhythm (on the beat, off the beat, counterpoint).",
          "Discuss how tempo changes in the music affect movement quality.",
          "Discuss how musical dynamics (loud/soft) influence movement size and energy.",
          "Conclude with how this relationship creates meaning or audience impact."
        ],
        solution: "Example: Contemporary dance. In contemporary dance the relationship with music ranges from strict rhythmic compliance to deliberate counterpoint. When movement aligns on the beat, it reinforces the music's structure; when movement works against the beat (counterpoint), it creates tension. Tempo changes prompt corresponding movement shifts — allegro sections often use sharp, dynamic phrases while adagio sections invite sustained, smooth movements. Dynamics mirror or contrast musical volume: a forte passage may drive large, expansive gestures; a pianissimo passage may call for intimate, restrained movement. Together music and movement create an integrated artistic experience that amplifies emotional meaning.",
        commonErrors: [
          "Failing to name a specific dance style.",
          "Discussing only rhythm and ignoring dynamics and tempo changes.",
          "Describing the music without linking to how movement responds.",
          "Confusing 'dynamics' (loud/soft) with 'tempo' (speed)."
        ]
      },
      {
        question: "What is the role of improvisation in the creative process of dance-making? Discuss with reference to at least two techniques.",
        steps: [
          "Define improvisation in the context of dance.",
          "Explain its role in the creative process (generating raw material, problem-solving, discovering movement vocabulary).",
          "Describe technique 1: structured improvisation (e.g., movement scores).",
          "Describe technique 2: contact improvisation or stream-of-consciousness movement.",
          "Discuss how improvised material is then refined and set in choreography."
        ],
        solution: "Improvisation is spontaneous, unplanned movement used as a creative tool. In choreography it generates raw movement material that choreographers would not discover through planned exercise alone. Structured improvisation uses a score (a set of loose instructions or constraints) to guide exploration — for example, 'move only at low level, respond to your partner's weight changes'. Contact improvisation involves two or more dancers sharing and exchanging weight, discovering unexpected pathways through physical conversation. Stream-of-consciousness improvisation bypasses analytical thinking to access authentic movement responses. The choreographer then observes, selects, and refines improvised material, transforming it into set choreography.",
        commonErrors: [
          "Treating improvisation as 'random' rather than as a structured creative tool.",
          "Naming techniques without explaining how they generate choreographic material.",
          "Failing to distinguish between improvisation as a creative tool and improvisation as a performance mode.",
          "Not mentioning how improvised material is refined into set work."
        ]
      },
      {
        question: "Describe the historical development of a South African indigenous dance form, including its cultural context and contemporary adaptations.",
        steps: [
          "Name the dance form and identify the cultural group.",
          "Describe its traditional/historical context (ceremonies, social occasions, spiritual function).",
          "Explain its key movement characteristics.",
          "Discuss how colonialism, urbanisation, or other forces influenced it.",
          "Describe contemporary adaptations or fusion with other styles."
        ],
        solution: "Example: Zulu Ngoma. Ngoma is performed by Zulu communities during ceremonies including weddings, initiations, and celebrations. Historically it affirmed communal identity and honoured ancestors. Key movements include high knee lifts, stamping, synchronised group formations, and call-and-response singing. Colonialism and urbanisation disrupted traditional transmission but also led to competitive Ngoma at cultural festivals. Contemporary choreographers integrate Ngoma vocabulary — the stamp, the communal call-and-response structure — into contemporary and theatrical dance, creating fusion works that honour tradition while reaching new audiences. Cultural sensitivity in this adaptation is debated: some view stage adaptation as appreciation, others as appropriation.",
        commonErrors: [
          "Describing only the movements without discussing cultural context.",
          "Ignoring the impact of historical forces on the dance form.",
          "Presenting contemporary adaptation uncritically without noting debates around appropriation.",
          "Confusing Ngoma with other Southern African dance traditions."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Bespreek die rol van die dans in 'n gekose Suid-Afrikaanse kulturele tradisie, met verwysing na funksie, beweging en musikale begeleiding.",
        steps: [
          "Identifiseer die kulturele groep en danstradisie.",
          "Bespreek die funksie (seremonieel, sosiaal, geestelik).",
          "Beskryf die sleutelbeweging eienskappe.",
          "Bespreek die musikale of vokale begeleiding.",
          "Sluit af met die hedendaagse relevansie van hierdie tradisie."
        ],
        solution: "Voorbeeld: Xhosa Umxhentso. Umxhentso word uitgevoer tydens inisiasie, troue en gemeenskapsbyeenkomste. Die funksie is sosiaal en geestelik — dit eer voorouers en versterk gemeenskapsbande. Sleutelbewegings sluit in ritmiese stampbewegings, koördinasie van arms en bene, en fyn handbewegings by vroue. Begeleiding sluit in gesang (uhadi-boog of ingoma-sang) en klapping. Hedendaags word Umxhentso by skoolkompetisies, kulturele feeste en teaterprodukte aangebied, wat tradisionele transmissie aanvul en breër bewustheid skep.",
        commonErrors: [
          "Bespreek slegs die bewegings sonder om funksie of konteks te noem.",
          "Vergeet van musikale of vokale begeleiding.",
          "Nie 'n spesifieke Suid-Afrikaanse danstradisie te noem nie.",
          "Behandel alle inheemse dansstyle asof hulle dieselfde is."
        ]
      },
      {
        question: "Verduidelik hoe 'n choreograaf ligaamlike bewussyn ('body awareness') gebruik om 'n sterk dansprestasie te skep.",
        steps: [
          "Definieer ligaamlike bewussyn.",
          "Verduidelik propriosepsie (hoe die danser hulle liggaam in die ruimte ervaar).",
          "Bespreek uitlijning en hoe dit prestasie beïnvloed.",
          "Bespreek die rol van asem in bewegingskwaliteit.",
          "Sluit af met hoe ligaamlike bewussyn choreografiese doelstellings ondersteun."
        ],
        solution: "Ligaamlike bewussyn is die vermoë om akkuraat te weet wat die liggaam doen op enige gegewe oomblik. Propriosepsie — die sintuig wat liggaamsposisie waarneem — laat dansers toe om akkurate lyns, balans en samewerking met medespelers te handhaaf sonder om voortdurend te kyk. Uitlijning (korrekte liggaamshoudingslyne) verminder besering en verbeter die estetiese kwaliteit van bewegings. Asem koördineer bewegingsphrases — uitasem vergemaklik uitbreiding, inasem voorbereiding. Choreograwe gebruik ligaamlike bewussyn deur dansers te leer om hul liggame as presiese instrumente te gebruik, sodat elke beweging doelgerig en presies is.",
        commonErrors: [
          "Verwar ligaamlike bewussyn met bloot 'n goeie geheue vir koreografie.",
          "Noem uitlijning sonder om die effek op estetiese kwaliteit of besering te verduidelik.",
          "Vergeet die rol van asem.",
          "Skryf in algemene terme sonder spesifieke dans-verwante voorbeelde."
        ]
      },
      {
        question: "Bespreek die verskil tussen tegniese vaardigheid en artistieke uitdrukking in dans en hoe albei beoordeel word.",
        steps: [
          "Definieer tegniese vaardigheid.",
          "Definieer artistieke uitdrukking.",
          "Verduidelik hoe die twee saamwerk.",
          "Beskryf beoordelingskriteria vir elkeen.",
          "Gee 'n voorbeeld van 'n danser wat een het maar nie die ander nie."
        ],
        solution: "Tegniese vaardigheid verwys na die presisie, krag, en beheer van beweging — korrekte voetposisies, balans, lyns, en koordinasie. Artistieke uitdrukking is die vermoë om emosie, narratief, of idee oor te dra — 'musikaliteit', karakter, teenwoordigheid op die verhoog. Beoordeling: tegniese kriteria sluit in uitlijning, suiwerheid van posisie, en uitvoering van stylspesifieke vereistes. Artistieke kriteria sluit in dinamiese variasie, musikaliteit, en emosionele egtheid. Beide is noodsaaklik: 'n danser wat net tegnies is, lyk meganies; een wat net uitdrukkend is sonder tegniek, mank aan kontrole. Die beste presteerders integreer albei.",
        commonErrors: [
          "Behandel tegniese vaardigheid en artistieke uitdrukking as sinonieme.",
          "Noem slegs een stel beoordelingskriteria.",
          "Geen voorbeeld gee van hoe die twee kan bots of saamwerk nie.",
          "Gee nie duidelike definisies vir albei terme nie."
        ]
      }
    ]
  },
  "DANCE-5": {
    workedExamplesEn: [
      {
        question: "Explain the concept of 'effort' (Laban Movement Analysis) and apply it to a specific dance sequence.",
        steps: [
          "Define Laban Movement Analysis (LMA) briefly.",
          "Explain the four effort qualities: Weight (strong/light), Space (direct/indirect), Time (sudden/sustained), Flow (bound/free).",
          "Describe a simple movement sequence (e.g., a leap followed by a slow spiral to the floor).",
          "Apply at least three effort qualities to this sequence.",
          "Explain how varying effort qualities changes the expressive character of the movement."
        ],
        solution: "Laban Movement Analysis categorises movement qualities to help performers and choreographers understand and communicate movement. The four effort qualities are: Weight (strong — committed, powerful; light — delicate, effortless), Space (direct — focused, single-focus; indirect — multi-focus, meandering), Time (sudden — urgent, impulsive; sustained — unhurried, lingering), Flow (bound — controlled, restrained; free — ongoing, fluid). Applied to a leap followed by a spiral descent: the leap may be strong weight, sudden time, direct space — explosive and purposeful. The spiral descent shifts to light weight, sustained time, free flow — releasing and melting into the floor. This contrast creates expressive arc from power to surrender.",
        commonErrors: [
          "Confusing LMA effort qualities with Rudolf Laban's space harmony concepts.",
          "Listing only two effort qualities instead of all four.",
          "Describing the sequence without applying LMA vocabulary.",
          "Treating 'effort' as synonymous with 'energy' without specifying the bipolar qualities."
        ]
      },
      {
        question: "Discuss the responsibilities of a production team member (e.g., lighting designer or costume designer) in a dance production.",
        steps: [
          "Name the specific production role.",
          "Describe the primary responsibilities in pre-production (planning, design).",
          "Describe responsibilities during rehearsal (fittings, technical run-throughs).",
          "Describe responsibilities on performance day.",
          "Explain how this role collaborates with the choreographer and other team members."
        ],
        solution: "Lighting Designer. Pre-production: reads the artistic concept, attends rehearsals, designs a lighting plot (positions of lanterns, colour gels, angles), liaises with the choreographer to understand intention. During rehearsal: attends technical rehearsals, programs cues in the lighting desk, adjusts intensities and colours in response to feedback. Performance day: supervises rigging, conducts focus sessions, runs lighting checks, calls cues or programs auto-cue. Collaboration: the lighting designer works alongside sound, costume, and set designers to ensure a coherent visual and aural world; any design decision affecting sight lines or colour palette is made in consultation with the choreographer.",
        commonErrors: [
          "Describing responsibilities in vague terms ('makes it look nice') without specifics.",
          "Forgetting pre-production planning and only discussing performance day.",
          "Not mentioning collaboration with other team members.",
          "Confusing technical theatre roles (e.g., calling lighting designer and stage manager the same role)."
        ]
      },
      {
        question: "Compare and contrast ballet and contemporary dance in terms of technique, aesthetic, and cultural context.",
        steps: [
          "Briefly define each style.",
          "Compare technique (turnout, use of floor, movement vocabulary).",
          "Compare aesthetic values (form, expression, what is considered beautiful).",
          "Compare cultural/historical context (European court origins vs 20th-century rebellion).",
          "Identify a key similarity and a key difference."
        ],
        solution: "Ballet emerged from 16th-century European court entertainment and codified its technique over centuries: strict turnout, pointed feet, elevated centre of gravity, formal vocabulary (plié, relevé, arabesque). Its aesthetic prizes precision, elongation, and transcendence of gravity. Contemporary dance arose in the 20th century partly as a reaction against ballet's constraints: it embraces natural alignment, flexed feet, floor work, improvisation, and diverse body types. Its aesthetic values authenticity of expression over formal perfection. Culturally, ballet was aristocratic; contemporary dance democratised the art form. Key similarity: both require rigorous technical training. Key difference: ballet uses a prescribed codified vocabulary; contemporary dance is eclectic, drawing from multiple traditions.",
        commonErrors: [
          "Describing only one style and not making a comparison.",
          "Claiming contemporary dance has no technique — it has extensive technique.",
          "Ignoring cultural/historical context.",
          "Conflating 'modern dance' (Humphrey, Graham) with 'contemporary dance' without distinguishing the periods."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die belang van opwarming en afkoeling vir 'n danser en beskryf 'n tipiese opwarmingrutiine.",
        steps: [
          "Verduidelik die fisiologiese doel van opwarming.",
          "Bespreek die risiko van besering sonder opwarming.",
          "Beskryf 'n tipiese opwarmingrutiine (kardio, rekwerk, spiervoorbereiding).",
          "Verduidelik die funksie van afkoeling.",
          "Sluit af met hoe opwarming en afkoeling 'n danser se loopbaan beskerm."
        ],
        solution: "Opwarming verhoog liggaamstemperatuur, bloedvloei na spiere, en gewrig-fleksibiliteit, wat prestasie verbeter en besering verminder. Sonder opwarming is spiere koud en onbuigsaam — risko's sluit in spierstuwings, seenbeserings, en gewrikverstuitings. Tipiese opwarmingrutiine: 5 minute kardio (ligte jogging of skipping), 10 minute dinamiese rek (been-swaai, heupboogies), 10 minute barre of sentrum-werk teen lae intensiteit. Afkoeling vertraag die hartklop geleidelik, verminder melksuuropbou, en verbeter herstel deur statiese rek. Gereelde opwarming en afkoeling verleng 'n danser se professionele loopbaan deur chroniesebesering te voorkom.",
        commonErrors: [
          "Beskryf opwarming as slegs 'n paar strekke sonder kardiovaskulêre komponent.",
          "Noem nie die fisiologiese voordele van opwarming nie.",
          "Vergeet afkoeling heeltemal.",
          "Verwar statiese rek (afkoeling) met dinamiese rek (opwarming)."
        ]
      },
      {
        question: "Bespreek hoe 'n danser emosionele outentiekheid in 'n uitvoering kan bereik.",
        steps: [
          "Definieer emosionele outentiekheid in dans.",
          "Bespreek die rol van karakterstudie en intensie.",
          "Verduidelik hoe liggaamlike bewussyn emosie oor kan dra.",
          "Bespreek die gebruik van improvisasie om emosionele materiaal te verken.",
          "Sluit af met die balans tussen tegniese beheer en emosionele eerlikheid."
        ],
        solution: "Emosionele outentiekheid is wanneer 'n danser se uitvoering 'n opregte, waarneembare emosionele kwaliteit dra wat die gehoor bereik. Karakterstudie en duidelike intensie — die danser weet 'wat wil ek sê?' — gee rigting aan elke beweging. Liggaamlike bewussyn laat die danser toe om emosie deur die liggaam te kanaliseer in plaas van bloot fasiale uitdrukking. Improvisasie in repetisie help dansers om outentieke emosionele reaksies te ontdek wat dan in die gesetde koreografie ingebou word. Die uitdaging is om emosionele eerlikheid te handhaaf terwyl tegniese korrekte bly: te veel selfbewustheid kil die outentiekheid, te min tegniese beheer verberg die intensie in slordige uitvoering.",
        commonErrors: [
          "Beskou emosionele uitdrukking as slegs fasiale uitdrukking.",
          "Gee nie 'n metode om emosie te verken of te bereik nie.",
          "Ignoreer die spanning tussen tegniek en uitdrukking.",
          "Behandel outentiekheid as 'n talent in plaas van 'n vaardigheid wat ontwikkel kan word."
        ]
      },
      {
        question: "Wat is die rol van die versamelende stuk (ensemble work) in dans, en hoe verskil dit van solowerk?",
        steps: [
          "Definieer ensemble werk in dans.",
          "Beskryf die vaardighede wat ensemble werk vereis (samewerking, luistering, aanpassing).",
          "Kontrasteer met solowerk (self-aandrywing, individuele interpretasie).",
          "Bespreek die choreografiese benadering tot ensemble (unisoon, kanon, heterofonie).",
          "Sluit af met die artistieke voordele van elk."
        ],
        solution: "Ensemble werk verwys na dans deur 'n groep waar koördinasie en samewerking sentraal is. Dit vereis dat elke danser aktief luister, aanpas, en reaksies deurgee — 'n gesamentlike bewussyn van tempo, ruimte, en energie. Solowerk plaas die volle artistieke las op een danser wat persoonlike interpretasie en selfmotivering vereis. Choreografies bied ensemble 'n wye reeks moontlikhede: unisoon (almal saam) vir kragtige visuele impak; kanon (opvolgende frases) vir tyds-kontras; heterofonie (variante van dieselfde frase gelyktydig) vir kompleksiteit. Ensemble werk voeg visuele en ruimtelike rykheid by; solowerk bied diepte van individuele uitdrukking.",
        commonErrors: [
          "Beskryf ensemble werk as 'groepwerk' sonder om spesifieke choreografiese tegnieke te noem.",
          "Noem nie die vaardighede wat ensemble werk van 'n danser vereis nie.",
          "Ignoreer die kontras met solowerk.",
          "Verwar unisoon en kanon."
        ]
      }
    ]
  },
  "MUSIC-1": {
    workedExamplesEn: [
      {
        question: "Explain the difference between major and minor scales and describe the emotional character typically associated with each.",
        steps: [
          "Define a scale in music theory.",
          "State the interval pattern of the major scale (W-W-H-W-W-W-H).",
          "State the interval pattern of the natural minor scale (W-H-W-W-H-W-W).",
          "Explain why the third (and sixth/seventh) degree creates the major/minor distinction.",
          "Describe the emotional associations of each and give a musical example."
        ],
        solution: "A scale is a set of pitches arranged in ascending or descending order. The major scale follows the interval pattern: Whole-Whole-Half-Whole-Whole-Whole-Half (e.g., C-D-E-F-G-A-B-C). The natural minor scale follows: Whole-Half-Whole-Whole-Half-Whole-Whole (e.g., A-B-C-D-E-F-G-A). The lowered 3rd degree (minor third) gives the minor scale its characteristic sound. Major keys are conventionally described as bright, joyful, or triumphant (e.g., Beethoven's 'Ode to Joy'); minor keys as melancholic, tense, or serious (e.g., Chopin's nocturnes). These associations are culturally learned but widely consistent in Western tonal music.",
        commonErrors: [
          "Confusing the interval pattern — writing W-H instead of W-W-H at the start of the major scale.",
          "Stating the harmonic minor without specifying which minor variant is being described.",
          "Overgeneralising: not all major = happy; not all minor = sad.",
          "Not giving a musical example to illustrate the concept."
        ]
      },
      {
        question: "What is harmony in music? Explain the concept of consonance and dissonance with examples.",
        steps: [
          "Define harmony.",
          "Define consonance and give an example of a consonant interval.",
          "Define dissonance and give an example of a dissonant interval.",
          "Explain how composers use dissonance and resolution in music.",
          "Give a musical context where dissonance is used expressively."
        ],
        solution: "Harmony refers to the simultaneous sounding of two or more pitches. Consonance describes intervals or chords that sound stable and restful — examples include the perfect fifth (e.g., C-G) and the major third (C-E). Dissonance describes intervals or chords that sound tense or unstable — examples include the minor second (C-Db) and the tritone (C-F#). Composers use dissonance to create tension, which is then resolved to consonance, generating musical motion and emotional release. For example, a dominant seventh chord (G-B-D-F in C major) creates tension that resolves to the tonic chord (C-E-G), a fundamental cadential pattern in Western music.",
        commonErrors: [
          "Defining harmony as melody (harmony = chords; melody = single line).",
          "Listing only one example of consonance or dissonance.",
          "Failing to mention resolution as the counterpart of dissonance.",
          "Confusing intervals with chords."
        ]
      },
      {
        question: "Describe the four families of orchestral instruments and give two examples from each family, explaining what produces the sound.",
        steps: [
          "Name the four instrument families.",
          "For each family: name two instruments and explain the sound-production mechanism.",
          "Note any special sub-categories (e.g., stopped vs open brass).",
          "Conclude with how the families are typically arranged in an orchestra."
        ],
        solution: "The four orchestral instrument families are: (1) Strings — sound produced by bowing or plucking stretched strings; examples: violin (bowed), harp (plucked). (2) Woodwind — sound produced by blowing air across a reed or an edge; examples: flute (edge-blown, no reed), clarinet (single reed). (3) Brass — sound produced by the player's vibrating lips into a cup mouthpiece; examples: trumpet, French horn. (4) Percussion — sound produced by striking, shaking, or scraping; examples: snare drum (struck), marimba (struck). In a standard orchestra: strings at the front, woodwind and brass behind, percussion at the back.",
        commonErrors: [
          "Placing the flute in the brass family because it is metal.",
          "Forgetting that plucked strings (harp, pizzicato) still belong to the string family.",
          "Saying 'blow air into the instrument' for woodwind without specifying reed vs edge.",
          "Listing fewer than two examples per family."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik wat nootwaarde is en hoe 'n maatsoort soos 4/4 die groepering van note beïnvloed.",
        steps: [
          "Definieer nootwaarde.",
          "Lys die gemeenskaplike nootwaardes (heelnoot, halfnoot, kwartnoot, agtstenoot, sestiende).",
          "Definieer maatsoort en verduidelik wat die bo- en ondergetal aandui.",
          "Pas dit toe op 4/4-maatsoort.",
          "Gee 'n voorbeeld van hoe 'n maat in 4/4 gevul kan word."
        ],
        solution: "Nootwaarde is die relatiewe duur van 'n noot. Heelnoot (4 slae), halfnoot (2 slae), kwartnoot (1 slag), agtstenoot (½ slag), sestiende (¼ slag). In 'n maatsoort dui die bobetal die getal slae per maat aan, en die ondergetal watter nootwaarde een slag verteenwoordig. In 4/4: 4 slae per maat, kwartnoot = 1 slag. 'n Maat kan gevul word deur byvoorbeeld: heelnoot (4 slae), of twee halfnote (2+2), of vier kwartbote (1+1+1+1). Koppeltekens en ruste verander ook die groepering.",
        commonErrors: [
          "Dink dat 4/4 beteken 4 note per maat — dit beteken 4 kwartslae.",
          "Verwar die bobetal en ondergetal se betekenis.",
          "Vergeet dat ruste ook nootwaardes het.",
          "Gee geen voorbeeld van hoe 'n maat gevul kan word nie."
        ]
      },
      {
        question: "Wat is die verskil tussen polofonie en homofonie? Gee 'n voorbeeld van elk.",
        steps: [
          "Definieer polofonie.",
          "Gee 'n voorbeeld van polifoniese musiek.",
          "Definieer homofonie.",
          "Gee 'n voorbeeld van homofoniese musiek.",
          "Verduidelik in watter komposisionele konteks elkeen gebruik word."
        ],
        solution: "Polofonie verwys na musiek met twee of meer onafhanklike melodiese lyne wat gelyktydig klink, elk met sy eie ritmiese en melodiese identiteit. Voorbeeld: 'n Bach-fuga waar meerdere stemme dieselfde melodie na mekaar inneem maar onafhanklik bly. Homofonie verwys na musiek waar een melodie dominant is en die ander stemme harmoniese ondersteuning bied ('koordstyl'). Voorbeeld: 'n tradisionele kerkkoraal waar die sopraan die melodie sing en alt, tenor en bas harmonieer. Polofonie word geassosieer met die Barokperiode; homofonie domineer die Klassieke en Romantiese periodes en populêre musiek.",
        commonErrors: [
          "Beskryf polofonie as 'vinnige musiek' en homofonie as 'stadige musiek'.",
          "Verwar polofonie (meerdere melodiese lyne) met harmonisasie (een melodie + akkoorde).",
          "Gee geen musikale voorbeelde nie.",
          "Sê homofonie is 'eenstemmige' musiek — dit is steeds meerstemmig, net met een melodielyn."
        ]
      },
      {
        question: "Bespreek die rol van dinamiek in musiekuitvoering en lys die gewone dinamiese simbole.",
        steps: [
          "Definieer dinamiek in musiek.",
          "Lys die kern dinamiese simbole en hul Italiaanse name.",
          "Verduidelik crescendo en decrescendo.",
          "Bespreek hoe dinamiek emosie en struktuur in uitvoering beïnvloed.",
          "Gee 'n voorbeeld uit bekende musiek."
        ],
        solution: "Dinamiek verwys na die luidsheid of sagsheid van musiek. Kern simbole: pp (pianissimo — baie sag), p (piano — sag), mp (mezzo-piano — matig sag), mf (mezzo-forte — matig hard), f (forte — hard), ff (fortissimo — baie hard). Crescendo (< of 'cresc.') dui 'n geleidelike toename in volume aan; decrescendo/diminuendo dui 'n afname aan. Dinamiek skep emosionele kontraste: 'n sagte pianissimo-passasie kan kwesbaar klink; 'n plotselinge fortissimo kan skok of triomf aandui. Voorbeeld: In Beethoven se 5de Simfonie word die beroemde vier-noot-motief eers forte aangebied en dan herhaal met variasies in dinamiek dwarsdeur die werk.",
        commonErrors: [
          "Verwar dinamiek met tempo (dinamiek = volume, tempo = spoed).",
          "Lys slegs 'hard' en 'sag' sonder die spesifieke Italiaanse terme.",
          "Vergeet crescendo en decrescendo.",
          "Verduidelik nie hoe dinamiek emosie of struktuur beïnvloed nie."
        ]
      }
    ]
  },
  "MUSIC-2": {
    workedExamplesEn: [
      {
        question: "Outline the main characteristics of the Baroque period in Western music (approximately 1600–1750) and name two major composers.",
        steps: [
          "State the approximate dates and context of the Baroque period.",
          "List at least four musical characteristics of Baroque music.",
          "Explain the role of basso continuo.",
          "Name two major Baroque composers and one significant work each.",
          "Briefly note how Baroque differs from the preceding Renaissance style."
        ],
        solution: "The Baroque period (c.1600–1750) followed the Renaissance and preceded the Classical era. Key characteristics: (1) Basso continuo — a continuous bass line realised by keyboard (harpsichord/organ) and bass instrument. (2) Ornamentation — trills, mordents, and turns embellish the melodic line. (3) Counterpoint — especially in fugues, independent melodic lines interweave. (4) Terraced dynamics — abrupt changes between loud and soft rather than gradual. (5) New forms: opera, oratorio, concerto grosso, and fugue emerge. Major composers: J.S. Bach (Mass in B minor) and G.F. Handel (Messiah). Unlike Renaissance polyphony's smooth voice-leading, Baroque music is more dramatic, expressive, and harmonically richer.",
        commonErrors: [
          "Confusing Baroque (1600–1750) with Classical (1750–1820) dates.",
          "Omitting the basso continuo as a defining Baroque characteristic.",
          "Listing only melody/harmony without mentioning counterpoint or form.",
          "Naming Mozart or Beethoven as Baroque composers."
        ]
      },
      {
        question: "Explain what is meant by 'sonata form' and identify the three main sections.",
        steps: [
          "Define sonata form and state the period in which it became standard.",
          "Name and describe the three main sections (Exposition, Development, Recapitulation).",
          "Explain the role of the first and second subject groups in the Exposition.",
          "Explain what happens harmonically in the Development.",
          "Note the optional Introduction and Coda."
        ],
        solution: "Sonata form is the most important structural design of the Classical period (c.1750–1820), used typically for the first movement of symphonies, concertos, and sonatas. Three sections: (1) Exposition — introduces two contrasting subject groups: the first subject in the tonic key, the second subject in the dominant (or relative major in minor keys). A bridge modulates between them. (2) Development — themes from the exposition are fragmented, manipulated, combined, and taken through multiple key areas, creating tension. (3) Recapitulation — both subjects return in the tonic key, resolving harmonic tension. An optional slow Introduction may precede the Exposition; a Coda may follow the Recapitulation.",
        commonErrors: [
          "Stating only two sections (missing one of the three).",
          "Confusing sonata form with sonata (a sonata is a multi-movement work; sonata form is a structural design).",
          "Saying both subjects return to the dominant in the Recapitulation — both must return in the tonic.",
          "Ignoring the role of modulation in the Development."
        ]
      },
      {
        question: "Describe the characteristics of Romantic period music (c.1820–1900) and discuss how composers expressed nationalism.",
        steps: [
          "State the dates and general ethos of the Romantic period.",
          "List at least four musical characteristics.",
          "Define musical nationalism.",
          "Give two examples of composers who used nationalism and how.",
          "Explain how Romantic music differs from Classical music."
        ],
        solution: "The Romantic period (c.1820–1900) emphasised personal emotion, individualism, and the natural world. Musical characteristics: (1) Expanded orchestra and dynamic range. (2) Longer, more lyrical melodies. (3) Greater harmonic complexity and chromaticism. (4) Programme music — music that tells a story or depicts a scene. (5) Virtuosic solo writing. Musical nationalism: composers incorporated folk melodies, dance rhythms, legends, and languages of their homeland to assert cultural identity. Examples: Edvard Grieg (Norway) used Norwegian folk idioms in the Peer Gynt Suite; Bedřich Smetana (Bohemia) depicted the Vltava river in Má vlast. Compared to Classical restraint and formal balance, Romantic music is more expressive, expansive, and emotionally intense.",
        commonErrors: [
          "Confusing Romanticism (music) with romance (love stories).",
          "Listing only one or two characteristics.",
          "Giving no specific example of how nationalism was expressed musically.",
          "Naming composers of other periods as Romantic."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die verskil tussen 'n simfonie en 'n konsert en beskryf die tipieke struktuur van elkeen.",
        steps: [
          "Definieer 'n simfonie.",
          "Definieer 'n konsert.",
          "Beskryf die tipiese bewegingstruktuur van 'n simfonie.",
          "Beskryf die tipiese bewegingstruktuur van 'n konsert.",
          "Wys op die cadenza as kenmerk van die konsert."
        ],
        solution: "Simfonie: 'n grootskaalse werk vir orkes sonder solist, gewoonlik in vier bewegings: 1. Allegro (sonatevorm), 2. Adagio (stadige beweging), 3. Scherzo of Menuet (drieslagmaat), 4. Finale (lewendig, dikwels rondovorm). Konsert: 'n werk vir 'n solo-instrument (of 'n klein groep) saam met orkes, gewoonlik in drie bewegings: 1. Allegro, 2. Stadige beweging, 3. Rondo of finalebeweging. 'n Kenmerkende element van die konsert is die cadenza — 'n solo-passasie (gewoonlik naby die einde van die eerste beweging) waar die solist improviseer of 'n uitgewerkte passasie uitvoer sonder orkesondersteuning om tegniese virtuositeit te demonstreer.",
        commonErrors: [
          "Sê 'n simfonie het 'n soloïs.",
          "Sê 'n konsert het vier bewegings (tipies drie).",
          "Vergeet om die cadenza te noem en te verduidelik.",
          "Verwar simfonie met simfoniese gedig (programme-musiek)."
        ]
      },
      {
        question: "Wat is 'n fuga en beskryf die hoofkenmerke daarvan aan die hand van Bach se werk.",
        steps: [
          "Definieer 'n fuga.",
          "Verduidelik die tema (subject) en antwoord (answer).",
          "Verduidelik die teema (countersubject).",
          "Bespreek die uitstelling (exposition) en episode.",
          "Gee 'n voorbeeld van 'n Bach-fuga."
        ],
        solution: "Fuga (meervoud: fugae) is 'n kontrapuntale komposisietegniek waarin 'n tema (subject) deur verskillende stemme nageboots word. Uitstelling: die tema word deur een stem bekendgestel, dan 'beantwoord' deur 'n tweede stem 'n kwint hoër (antwoord), terwyl die eerste stem 'n teentemema (countersubject) sing — so word elke stem die tema nageboots het. Episodes verbind terugkerende uitstellings deur fragmentasie en sekwensie van die tema. Hoogspreekpunt: stretto (oorvleuelende inskrywings). Bach se Das Wohltemperierte Klavier bevat 24 preludia en fugae — een in elke toonsoort — as 'n meesterwerk van Barokse kontrapunt.",
        commonErrors: [
          "Beskryf die fuga as 'herhaling van die melodie' sonder om meerdere onafhanklike stemme te noem.",
          "Verwar antwoord (a fifth higher) met 'n noot-vir-noot herhaling.",
          "Vergeet die countersubject.",
          "Noem geen spesifieke Bach-voorbeeld nie."
        ]
      },
      {
        question: "Bespreek die kenmerke van Afrikamusiek met verwysing na ritme, teksuur, en sosiale funksie.",
        steps: [
          "Definieer 'Afrika-musiek' in die konteks van Sub-Sahara tradisies.",
          "Bespreek ritmiese eienskappe (poliritmiek, siklies).",
          "Bespreek teksuur (polofonie, hocketing).",
          "Bespreek die sosiale funksie (seremonie, kommunikasie, gemeenskap).",
          "Gee twee spesifieke voorbeelde van Afrikamusiek-tradisies."
        ],
        solution: "Sub-Sahara Afrikamusiek is 'n diverse tradisie met gemeenskaplike kenmerke. Ritme: poliritmiek — meerdere ritmiese patrone klink gelyktydig in verskillende maatverdelings, wat 'n ryk ritmies weefsel skep. Siklies: frases word herhaal en gevarieer. Teksuur: hocketing — melodiese lyne word tussen stemme of instrumente verdeel (een stem speel noot 1, 'n ander noot 2, ens.). Roep-en-antwoord (call-and-response) is wydverspreid. Sosiale funksie: musiek is nie losstaand van lewe nie; dit begelei seremonies (geboorte, inisiasie, begrafnis), kommunikeer (tromtaal by Westerse/Sentraal-Afrikaanse gemeenskappe), en versterk sosiale kohesie. Voorbeelde: Mbira dzavadzimu (Zimbabwe — harpsikord-agtige plukinstrument) en Djembe-trommusiek (Wes-Afrika).",
        commonErrors: [
          "Behandel 'Afrika-musiek' as 'n homogene styl — dit is uiteenlopend.",
          "Beskryf net ritme sonder om teksuur of funksie te bespreek.",
          "Verwar poliritmiek (meerdere ritme-patrone) met syncopation (aksente op swak slae).",
          "Gee geen spesifieke voorbeelde of tradisies nie."
        ]
      }
    ]
  },
  "MUSIC-3": {
    workedExamplesEn: [
      {
        question: "Describe the elements a musician should consider when preparing for a performance, including technical and expressive aspects.",
        steps: [
          "List the technical elements to prepare (notes, rhythm, intonation, technique).",
          "List the expressive elements (dynamics, phrasing, articulation, tempo rubato).",
          "Discuss memorisation and score study.",
          "Discuss mental preparation and managing performance anxiety.",
          "Explain the role of rehearsal, including mock performances."
        ],
        solution: "Technical preparation: accurate pitch (especially for wind and string players — intonation), correct rhythmic values, secure fingering or bow technique, tone quality, and control of all tempo markings. Expressive preparation: shaping phrases (crescendos, diminuendos), choosing articulation (legato, staccato, accents), applying appropriate rubato within stylistic bounds, and realising dynamic contrasts authentically. Score study: understanding the harmonic structure, form, and historical context informs interpretive decisions. Memorisation: practising slowly, in sections, hands separately (for pianists), then reconstructing the whole. Mental preparation: controlled breathing, positive visualisation, mock performances in front of a small audience to simulate pressure. Anxiety management: focus on communicating the music rather than self-evaluation.",
        commonErrors: [
          "Focusing only on technical accuracy and ignoring expressive elements.",
          "Not mentioning mental preparation or performance anxiety.",
          "Listing memorisation as optional rather than expected at advanced level.",
          "Ignoring the historical/stylistic context that informs interpretation."
        ]
      },
      {
        question: "Explain the concept of 'tone colour' (timbre) and describe how different instruments and vocal types achieve different timbres.",
        steps: [
          "Define timbre/tone colour.",
          "Explain the physics of overtones/harmonics that create timbre.",
          "Give three contrasting instrumental timbres with descriptive adjectives.",
          "Describe the four main voice types (soprano, alto/contralto, tenor, bass) and their characteristic timbres.",
          "Explain how a composer uses contrasting timbres orchestrationally."
        ],
        solution: "Timbre (tone colour) is the quality that distinguishes one sound source from another at the same pitch and dynamic. It is determined by the pattern of overtones (harmonics) sounding above the fundamental frequency. Different materials, shapes, and production methods produce different overtone patterns. Instrumental timbres: oboe — reedy, nasal, penetrating; cello — warm, rich, resonant; trumpet — bright, brilliant, cutting. Voice types: soprano — bright, clear, high (e.g., operatic heroines); contralto/alto — deep, rich, dark; tenor — ringing, heroic; bass — dark, sonorous, weighty. A composer uses contrasting timbres to highlight melodies (solo oboe against strings), to blend (horn blends with both strings and woodwind), or to create colour contrasts between sections.",
        commonErrors: [
          "Defining timbre as 'volume' or 'pitch' — it is tone quality.",
          "Not mentioning overtones as the physical basis of timbre.",
          "Only listing instrument families without descriptive timbral adjectives.",
          "Confusing voice types (e.g., calling mezzo-soprano a 'medium voice' without specifying range and quality)."
        ]
      },
      {
        question: "What is rhythm and how do syncopation and polyrhythm add complexity to music?",
        steps: [
          "Define rhythm and distinguish it from beat and metre.",
          "Define syncopation with an example.",
          "Define polyrhythm with an example.",
          "Explain how syncopation creates a 'groove' or drive in popular and jazz music.",
          "Explain how polyrhythm is used in African, Latin, and contemporary music."
        ],
        solution: "Rhythm refers to the pattern of long and short durations of sound and silence. Beat is the underlying pulse; metre is the grouping of beats into bars. Syncopation: accenting or extending notes on weak beats or between beats, shifting the expected stress pattern. Example: in 4/4, accenting the offbeats (the 'and' between beats) creates a syncopated groove characteristic of jazz and funk. Polyrhythm: two or more conflicting rhythmic patterns sounding simultaneously, often in different metres or divisions. Example: 3-against-2 (triplets against duplets). In West African drumming, each drummer plays a different rhythmic cycle creating an interlocking polyrhythmic texture. In Latin music (clave) a 3-2 or 2-3 rhythmic pattern underpins the ensemble. Modern composers like Stravinsky used polyrhythm to create rhythmic instability.",
        commonErrors: [
          "Defining syncopation only as 'offbeat' without explaining the stress displacement.",
          "Confusing polyrhythm (simultaneous conflicting rhythms) with polymetre (different time signatures simultaneously).",
          "Not giving a musical example for either syncopation or polyrhythm.",
          "Describing rhythm as synonymous with beat."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik wat 'n kadans is en beskryf die vier hoofsoorte kadanse.",
        steps: [
          "Definieer 'n kadans.",
          "Beskryf die volmaakte kadans (V-I).",
          "Beskryf die halwe kadans (eindig op V).",
          "Beskryf die plagale kadans (IV-I).",
          "Beskryf die onderbroken kadans (V-VI)."
        ],
        solution: "Kadans: 'n reeks akkoorde wat 'n musikale frase sluit en rus of afsluiting bied. (1) Volmaakte kadans (authentic cadence): V→I, eindig op die tonika — volle afsluiting, definitief. (2) Halwe kadans (half cadence): enige akkoord→V, eindig op die dominant — voel onvolledig, soos 'n komma in 'n sin. (3) Plagale kadans (plagal cadence): IV→I — dikwels 'Amen'-kadans in kerklied, rus maar minder finaal as die volmaakte. (4) Onderbroken kadans (deceptive cadence): V→VI — die oor verwag V→I maar kry VI, wat verrassend klink. Kadanse organiseer musikale sin en kommunikeer struktuur aan die luisteraar.",
        commonErrors: [
          "Verwar volmaakte en plagale kadans.",
          "Sê halwe kadans eindig op I — dit eindig op V.",
          "Beskryf slegs twee kadanstipes.",
          "Geen musikale konteks of voorbeeld vir die onderbroken kadans nie."
        ]
      },
      {
        question: "Bespreek die proses van ensemblemusikmaak en wys op die vaardighede wat vereis word om effektief saam te speel.",
        steps: [
          "Definieer ensemble-spel.",
          "Bespreek luistervaardighede (aktief na ander luister).",
          "Bespreek balans en vermenging.",
          "Bespreek die rol van die dirigent of leier.",
          "Sluit af met hoe ensemble-spel individuele musikante ontwikkel."
        ],
        solution: "Ensemble-spel verwys na musiekmake deur 'n groep musikante saam — duo tot orkes. Vaardighede: (1) Aktiewe luister — elkeen moet na die geheel luister, nie net sy eie part nie; pitch, ritme, en dinamiek word intyds aangepas. (2) Balans en vermenging — die melodie moet hoorbaar wees; begeleiding moet ondergeskik bly; toonkleur moet in die ensemble smelt. (3) Intreepunte en ritmiese samewerking — begin, phraseer, en eindig saam. (4) Leierskap — by kamermusiek lei dikwels die eerste violis; by 'n orkes lei die dirigent deur gebare. Ensemble-ervaring ontwikkel musikante deur hulle te leer aanpas, toegee, en luister — vaardighede wat solo-spel nie volledig kan leer nie.",
        commonErrors: [
          "Beskryf ensemble-spel as bloot 'almal speel dieselfde noot gelyktydig'.",
          "Vergeet balans en vermenging.",
          "Noem nie die rol van 'n leier of dirigent nie.",
          "Nie verduidelik hoe ensemble-spel individuele groei bied nie."
        ]
      },
      {
        question: "Wat is vrye atoonale musiek en hoe verskil dit van toonaard-gebaseerde musiek?",
        steps: [
          "Definieer toonaard-gebaseerde musiek.",
          "Definieer atoonaliteit.",
          "Verduidelik Schoenberg se twaalf-noot tegniek.",
          "Bespreek hoe atoonale musiek die luisteraar anders ervaar.",
          "Gee 'n voorbeeld van 'n komponis en werk."
        ],
        solution: "Toonaard-gebaseerde musiek is georganiseer rondom 'n sentrale toon (tonika) waartoe ander note en akkoorde graviteer. Atoonaliteit: geen sentrale toon nie; alle 12 semitone van die chromaticse skaal is gelykwaardig. Schoenberg se twaalf-noot tegniek (dodekafonie): 'n toonkring ('tone row') word geskep deur al 12 note in 'n spesifieke volgorde te gebruik; die kring word gebruik soos-is, omgekeerd (retrograde), gespieël (inversion), of albei (retrograde inversion). Die luisteraar ervaar atoonale musiek dikwels as spanningsvol, verwarrend of vreemd omdat die verwagte gravitasie van een toon na 'n tonika ontbreek. Voorbeeld: Schoenberg, Suite op. 25 (piano).",
        commonErrors: [
          "Sê atoonaliteit beteken 'geen melodies' — atoonale musiek het steeds melodie en ritme.",
          "Verwar chromaticse musiek (gebruik all 12 semitone binne 'n toonaard) met atoonaliteit.",
          "Verduidelik nie die twaalf-noot tegniek nie.",
          "Gee geen voorbeeld nie."
        ]
      }
    ]
  },
  "MUSIC-4": {
    workedExamplesEn: [
      {
        question: "Discuss the origins and characteristics of jazz music, including its African American roots and key elements.",
        steps: [
          "State the historical origins of jazz (New Orleans, early 20th century).",
          "Describe the African American musical traditions that contributed to jazz.",
          "List key musical characteristics of jazz.",
          "Explain the role of improvisation.",
          "Name two early jazz innovators and their contributions."
        ],
        solution: "Jazz originated in New Orleans around 1900, emerging from the convergence of African American traditions: blues (emotional expressiveness, call-and-response, blue notes), ragtime (syncopated rhythms), spirituals, and work songs. Key characteristics: (1) Swing feel — a particular rhythmic lilt created by uneven subdivision of the beat. (2) Blue notes — flattened 3rd, 5th, and 7th scale degrees. (3) Improvisation — real-time composition over a harmonic structure. (4) Call-and-response. (5) Distinctive timbres — muted trumpet, growling trombone, wailing saxophone. Innovators: Louis Armstrong pioneered virtuosic solo trumpet improvisation; Duke Ellington developed sophisticated orchestral jazz composition. Jazz gave African Americans a powerful cultural voice and spread globally as a quintessential American art form.",
        commonErrors: [
          "Stating jazz originated in Europe or with classical music.",
          "Omitting improvisation as a defining characteristic.",
          "Confusing 'blue notes' with simply 'sad notes'.",
          "Not mentioning the African American cultural context."
        ]
      },
      {
        question: "Explain what is meant by 'call and response' in music and give examples from African traditional music and gospel.",
        steps: [
          "Define call and response.",
          "Describe how it functions in African traditional music (leader-chorus pattern).",
          "Describe how it functions in gospel music.",
          "Explain how call and response builds community participation.",
          "Note its influence on blues, jazz, and R&B."
        ],
        solution: "Call and response is a musical technique where a phrase (call) played or sung by one voice or instrument is answered by another voice or group (response). In African traditional music, a lead singer (soloist) sings a phrase; the community chorus responds — this pattern sustains collective participation in ceremonies and work. Example: Zulu or Xhosa group singing where the leader improvises while the chorus holds a recurring response phrase. In gospel music the same pattern occurs: a preacher or lead vocalist sings a verse; the choir or congregation responds with a refrain. This structure democratises participation and creates musical conversation. Its influence extends to blues (guitar riff answered by vocal), jazz (soloist and ensemble trading), and R&B/soul (lead singer and backing vocalists).",
        commonErrors: [
          "Describing call and response as only a Western gospel technique.",
          "Not explaining the communal function (participation, ceremony).",
          "Giving only one example instead of two different contexts.",
          "Confusing call and response with antiphony (though related, antiphony typically refers to alternating choirs)."
        ]
      },
      {
        question: "Compare isicathamiya with maskandi as distinctly South African music styles.",
        steps: [
          "Define and describe isicathamiya (origins, typical ensemble, characteristic features).",
          "Define and describe maskandi (origins, typical instruments, musical features).",
          "Compare the two in terms of purpose, performance context, and musical texture.",
          "Note any crossover or mutual influence.",
          "Identify one internationally known artist from each style."
        ],
        solution: "Isicathamiya: a cappella choral tradition developed by Zulu migrant workers in hostels in Durban and Johannesburg from the early 20th century. Performed by male choirs in close harmony, with a smooth, cushioned vocal blend and gentle choreography ('tiptoeing' — isicathamiya means 'to walk softly'). Purpose: entertainment and cultural identity in the urban migrant context. Maskandi: a Zulu guitar-based folk tradition combining guitar (picked in a melodic style derived from bow music), concertina or violin, and Zulu poetic lyrics (izibongo praise poetry style). More solo or small ensemble. Performance context: celebrations, storytelling, personal expression. Comparison: isicathamiya is choral and communal; maskandi is solo/small group and lyric-poetry-driven. International artist: isicathamiya — Ladysmith Black Mambazo (Grammy-winning); maskandi — Phuzekhemisi.",
        commonErrors: [
          "Confusing the two styles or describing them as equivalent.",
          "Not mentioning the migrant labour context for isicathamiya.",
          "Omitting the guitar's centrality to maskandi.",
          "Failing to name a recognisable artist from either style."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Bespreek die kenmerke van die bluestyl en verduidelik die 12-baarmaat-bluesskema.",
        steps: [
          "Definieer blues en gee sy historiese agtergrond.",
          "Lys die musiekkenmerke van blues (blounote, struktuur, teksuur).",
          "Beskryf die 12-baarmaat-bluesskema.",
          "Verduidelik die roep-en-antwoord tekststruktuur in bluestekste.",
          "Noem twee bekende blues-kunstenaars."
        ],
        solution: "Blues het aan die einde van die 19de eeu in die suide van die VSA uit Afro-Amerikaanse werkliedjies, spirituele en veldwerke ontstaan. Kenmerke: blounote (verlaagde 3de, 5de, 7de grade van die skaal), ekspressiewe vibrato, slides en bends op die kitaar, call-and-response tekststruktuur, en 'n emosionele uitdrukkingskwaliteit. 12-baarbluesskema (in C): ||: C7 (4 baartjies) | F7 (2) | C7 (2) | G7 (1) | F7 (1) | C7 (2) :|| — die akkoordvordering I7-IV7-I7-V7-IV7-I7. Tekststruktuur: 'n reël word gesing (roep), dan herhaal (antwoord-variasie), dan 'n afsluitende reël (nuwe inligting). Kunstenaars: Robert Johnson (Delta blues), B.B. King (elektriese blues).",
        commonErrors: [
          "Sê die 12-baarskema het 12 note (dit het 12 baartjies/maten).",
          "Vergeet blounote as 'n kenmerk.",
          "Beskryf nie die roep-en-antwoord tekststruktuur nie.",
          "Gee geen kunstenaarsname nie."
        ]
      },
      {
        question: "Verduidelik hoe Suid-Afrikaanse gospelmusiek 'n unieke kulturele identiteit uitdruk.",
        steps: [
          "Gee die oorsprong van SA gospel.",
          "Bespreek die vermenging van Westerse harmonie met Afrika-ritme.",
          "Bespreek die Sotho/Zulu/Xhosa-talige tradisies.",
          "Noem hoe gospel sosiale en politiese betekenis gedra het tydens apartheid.",
          "Noem twee bekende SA gospel-kunstenaars."
        ],
        solution: "SA gospel het sy wortels in die missiesgemeenskap-koortradisies van die 19de eeu, waar Westerse harmonie met Africa roep-en-antwoord patrone vermeng het. 'n Unieke SA-gospel-klank het ontstaan deur die vermenging van chromaticse vierdemstemming-harmonie met poliritmiek en Afrikaïse taalritme (Zulu, Sotho, Xhosa, Afrikaans). Tydens apartheid het gospel 'n ruimte vir vryheid en gemeenskapspirituele uitdrukking gebied buite staat-beheerde strukture — liedere het hoop en weerstand uitgedruk. Postapartheidsgospel omhels 'n breë spectrum van tradisioneel tot kontemporêr-Gospel-pop. Kunstenaars: Rebecca Malope ('koningin van gospel'), Joyous Celebration (ensemblegroep met massas aanbidding).",
        commonErrors: [
          "Beskryf SA gospel as identies aan Amerikaanse gospel.",
          "Vergeet die Afrika-ritmiese en talige invloede.",
          "Noem nie die sosiale/politiese konteks tydens apartheid nie.",
          "Gee geen spesifieke SA-kunstenaars nie."
        ]
      },
      {
        question: "Bespreek die invloed van tegnologie op die musiekbedryf en musikante se loopbane.",
        steps: [
          "Noem hoe opnametegnologie musiek getransformeer het.",
          "Bespreek digitale verspreiding en stroomingsdienste.",
          "Bespreek die rol van sosiale media in kunstenaarsloopbane.",
          "Noem die uitdagings (piraterie, lae stroomingsinkomste).",
          "Bespreek nuwe geleenthede (indie-musiek, self-vrylating, globale gehoor)."
        ],
        solution: "Opnametegnologie het lekommunikasie van musiek getransformeer — van akoestiese opnames na meerspoorbandopnames na digitale werkstasies (DAWs) wat indie-produksie moontlik maak in 'n tuisstudio. Stroomingsdienste (Spotify, Apple Music) het fisiese en digitale verkope vervang: gemakliker toegang vir luisteraars, maar laer per-stroom-inkomste vir kunstenaars. Sosiale media (TikTok, Instagram, YouTube) laat kunstenaars toe om gehore te bou sonder rekordmaatskappyondersteuning. Uitdagings: piraterie verminder inkomste; algoritmes begunstig gevestigde kunstenaars; streaming betaal klein kunstenaars min. Geleenthede: globale bereik, onmiddellike vrylating, direkte gehoorverbinding, en platforms soos Bandcamp waar kunstenaars meer behou. Tegnologie demokratiseer produksie maar kompliseer inkomstestrome.",
        commonErrors: [
          "Bespreek slegs die voordele of slegs die nadele.",
          "Vergeet die rol van sosiale media.",
          "Noem nie spesifieke tegnologieë of platforms nie.",
          "Veralgemeen sonder om die invloed op verskillende aspekte (produksie, verspreiding, inkomste) te onderskei."
        ]
      }
    ]
  },
  "MUSIC-5": {
    workedExamplesEn: [
      {
        question: "Explain the process of composing a 16-bar melody in ternary (ABA) form in a given key.",
        steps: [
          "Define ternary form and its sections.",
          "Outline the key and tonal plan (A in tonic, B contrasting, A' return).",
          "Describe how to construct the A section (8 bars, ending with authentic cadence).",
          "Describe how to construct the B section (contrasting key, mood, or texture).",
          "Explain how to revise and refine the melody for coherence and expressiveness."
        ],
        solution: "Ternary (ABA) form: A section, contrasting B section, return of A (often A'). Key plan for C major: A section (bars 1–8) in C major, establishing tonic and ending with a perfect cadence; B section (bars 9–12) moving to G major (dominant) or A minor (relative minor) with contrasting character; A' (bars 13–16) returns to C major. Composing A: start on a tonic note, balance steps and leaps, create a 4-bar phrase ending on V (half cadence), then a 4-bar answering phrase ending on I (authentic cadence). B section: change the rhythm or register, modulate, create contrast. A': may be shortened or slightly ornamented. Revision: check for melodic climax, rhythmic variety, and that the melody 'breathes' at phrase boundaries.",
        commonErrors: [
          "Not returning to the tonic in the A' section.",
          "Making B section identical to A — it must contrast.",
          "Ending A section on V instead of I (no authentic cadence).",
          "Forgetting to check for coherence across all 16 bars."
        ]
      },
      {
        question: "What is word painting in vocal music and give three examples from Western art music or popular music.",
        steps: [
          "Define word painting (text painting).",
          "Explain how composers match musical elements to textual meaning.",
          "Give example 1 (ascending line for 'rise' or 'heaven').",
          "Give example 2 (chromatic/dissonant passage for pain or grief).",
          "Give example 3 (fast, light texture for joy or laughter)."
        ],
        solution: "Word painting (text painting) is a compositional technique where musical elements directly illustrate or express the meaning of the text. Composers match pitch, rhythm, dynamics, harmony, and texture to words. Example 1 (pitch): 'He ascended into heaven' — the melody rises stepwise to illustrate ascent, a common device in Baroque choral music (e.g., Handel's Messiah). Example 2 (harmony): a sharp dissonance or chromaticism on words like 'sorrow', 'death', or 'pain' — e.g., Purcell's Dido's Lament uses a chromatic descending bass to represent grief. Example 3 (texture/rhythm): 'The trumpet shall sound' (Handel's Messiah) — an actual trumpet plays with fanfare rhythms to illustrate the text. Modern example: in Adele's 'Hello', the falling melodic line mirrors the resigned tone of the text.",
        commonErrors: [
          "Defining word painting vaguely as 'matching music to lyrics'.",
          "Giving only one example instead of three.",
          "Citing examples from the wrong period or genre without connecting technique to specific musical element.",
          "Confusing word painting (text illustration) with programme music (narrative without text)."
        ]
      },
      {
        question: "Discuss the role of a conductor in a large ensemble and explain the conducting patterns for 2/4, 3/4, and 4/4 time.",
        steps: [
          "Describe the general role and responsibilities of a conductor.",
          "Explain the preparatory beat and its function.",
          "Describe the 2/4 conducting pattern (down-up).",
          "Describe the 3/4 conducting pattern (down-out-up).",
          "Describe the 4/4 conducting pattern (down-left-right-up)."
        ],
        solution: "A conductor communicates tempo, dynamics, phrasing, and artistic interpretation to a large ensemble through gesture, facial expression, and baton technique. The preparatory beat (upbeat) signals the ensemble to breathe together and sets the tempo before the first beat. Conducting patterns: 2/4 — beat 1: baton moves down; beat 2: baton moves up. 3/4 — beat 1: down; beat 2: out to right; beat 3: up. 4/4 — beat 1: down; beat 2: left; beat 3: right; beat 4: up. The size of gesture conveys dynamic (large = loud, small = soft); the sharpness/smoothness of movement conveys articulation and style. The conductor also gives cues to individual sections and shapes long musical phrases across the entire ensemble.",
        commonErrors: [
          "Confusing the 3/4 and 4/4 conducting patterns.",
          "Forgetting the preparatory beat.",
          "Saying the conductor 'plays' a role without describing specific gesture techniques.",
          "Not explaining how gesture size relates to dynamics."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die verskil tussen polofonie, homofonie en monofonie, met 'n voorbeeld van elk.",
        steps: [
          "Definieer monofonie en gee 'n voorbeeld.",
          "Definieer homofonie en gee 'n voorbeeld.",
          "Definieer polofonie en gee 'n voorbeeld.",
          "Verduidelik in watter historiese periode elkeen dominant was.",
          "Sluit af met hoe komponistore teksuur as uitdrukkingsmiddel gebruik."
        ],
        solution: "Monofonie: enkelstemmelyne sonder harmoniese ondersteuning. Voorbeeld: Gregoriaanse koraalsang (middeleeus). Homofonie: een melodielyn met harmoniese begeleiding. Voorbeeld: 'n klassieke klaviersonate waar die regterkant melodie speel en die linkerkant akkoorde. Polofonie: twee of meer onafhanklike melodiese lyne gelyktydig. Voorbeeld: Bach-fuga. Historiese periode: monofonie (Middeleeue), polofonie (Renaissance/Barok), homofonie (Klassiek/Romanties en kontemporêre musiek). Teksuur as uitdrukkingsmiddel: monofonie skep kwesbare eenvoud; polofonie skep intellektuele kompleksiteit; homofonie skep melodiese duidelikheid. 'n Komponis kan teksuur wissel binne een werk om kontraste te skep.",
        commonErrors: [
          "Verwar homofonie met monofonie — homofonie het harmoniese ondersteuning.",
          "Sê polofonie is net 'vinnige musiek'.",
          "Noem geen historiese voorbeelde nie.",
          "Vergeet dat teksuur 'n uitdrukkingskeuse is, nie net 'n beskrywingskategorie nie."
        ]
      },
      {
        question: "Bespreek hoe 'n komponis 'n tema ontwikkel en verander deur die gebruik van variasietegnieke.",
        steps: [
          "Definieer tematiese ontwikkeling.",
          "Verduidelik melodiese variasie (ornamentasie, wysigings).",
          "Verduidelik ritmies variasie (augmentasie, diminusie).",
          "Verduidelik harmoniese variasie (reharmonisasie, modus-verandering).",
          "Gee 'n voorbeeld van 'n werk in variasievorm."
        ],
        solution: "Tematiese ontwikkeling is die proses om 'n tema oor tyd te transformeer terwyl dit herkenbaar bly. Melodiese variasie: ornamenteer die melodie met trille en passeernote, of wysig die intervalle. Ritmiese variasie: augmentasie — vergroot die nootwaardes (kwartnoote word halfnoote — die tema klink stadiger en plegtig); diminusie — verminder die nootwaardes (die tema klink vinniger en ligter). Harmoniese variasie: speel die tema in 'n mineursleutel as dit oorspronklik majeur was, of gebruik 'n ander harmonisasie. Voorbeeld: Beethoven se 'Diabelli Variasies' (33 variasies op 'n tema) en Mozart se 'Ah, vous dirais-je maman' (Twinkle variasies) illustreer hoe 'n eenvoudige tema deur verskillende tegnieke getransformeer word.",
        commonErrors: [
          "Verduidelik slegs een variasietegniek.",
          "Sê 'n variasie is bloot 'herhaling met geringe verandering' sonder om die spesifieke tegnieke te noem.",
          "Vergeet augmentasie en diminusie.",
          "Gee geen musikale voorbeeld nie."
        ]
      },
      {
        question: "Bespreek die kenmerke van hedendaagse pop en rocktydperk musiek en hoe dit van klassieke musiek verskil.",
        steps: [
          "Definieer pop en rock musiek in konteks.",
          "Lys musiekkenmerke (instrumentasie, struktuur, produksie).",
          "Bespreek die vers-koor-struktuur.",
          "Vergelyk met klassieke musiek se strukture en instrumentasie.",
          "Noem twee bekende pop/rock kunstenaars en hul kenmerkende styl."
        ],
        solution: "Pop en rock is populêre musiekgenres van die 20ste en 21ste eeu, gedryf deur kitaar, bas, slaginstrument, en vokale. Kenmerke: elektroniese versterking, digitale produksie (DAW, layering, autotune), eenvoudige harmoniese progressies (I-V-vi-IV en variante), herhalende ritmies groove. Struktuur: vers-koor-brug (ABA + brug of ABABCAB); die koor is die hookaantal en herhaal meeste. Vergelyk met klassiek: pop gebruik gestandaardiseerde verse-koor-strukture; klassiek gebruik sonaatvorm, fuga, variasies. Pop-orkestrering: kitaar, bas, slaginstrument, sintetiseerder; klassiek: stryk/blaas/slaginstrument-orkes. Kunstenaars: Beyoncé — R&B-pop met sterk vokale en produksie; Metallica — swaar rock met komplekse ritmies en gitaar riffs.",
        commonErrors: [
          "Behandel alle pop en rock as dieselfde genre.",
          "Ignoreer die rol van digitale produksie in hedendaagse pop.",
          "Vergelyk nie met klassieke musiek nie.",
          "Gee geen kunstenaarsname nie."
        ]
      }
    ]
  },
  "DESIGN-1": {
    workedExamplesEn: [
      {
        question: "Explain the seven elements of design and describe how each contributes to a visual composition.",
        steps: [
          "List the seven elements: line, shape, form, space, colour, texture, value/tone.",
          "Define line and describe its types and expressive qualities.",
          "Define shape (2D) and form (3D) and distinguish between them.",
          "Explain positive and negative space.",
          "Describe colour (hue, saturation, brightness), texture (tactile vs visual), and value/tone."
        ],
        solution: "The seven elements of design are: (1) Line — a moving point; can be horizontal (calm), vertical (strong), diagonal (dynamic), curved (fluid). (2) Shape — a 2D enclosed area; geometric (precise) or organic (natural). (3) Form — a 3D shape with volume and mass. (4) Space — the area around and between subjects; positive space = the subject; negative space = the background. (5) Colour — defined by hue (the colour itself), saturation (intensity), and brightness/value. (6) Texture — the surface quality, tactile (actual roughness) or visual (implied texture through mark-making). (7) Value/Tone — the lightness or darkness of a colour or area, creating depth and emphasis. Together these elements give designers vocabulary to construct any visual composition.",
        commonErrors: [
          "Listing only 5–6 elements and omitting texture or value.",
          "Confusing shape (2D) and form (3D).",
          "Describing negative space as 'empty' — it is an active compositional element.",
          "Conflating colour hue with colour value."
        ]
      },
      {
        question: "Describe the seven principles of design and explain how balance and contrast create effective compositions.",
        steps: [
          "List the seven principles: balance, contrast, emphasis, rhythm/movement, pattern, unity, proportion.",
          "Define symmetrical, asymmetrical, and radial balance.",
          "Define contrast and list types (colour, size, texture, shape).",
          "Explain how balance creates stability and contrast creates visual interest.",
          "Give an example of a design that uses both effectively."
        ],
        solution: "The seven principles of design: balance, contrast, emphasis (focal point), rhythm/movement, pattern (repetition), unity (harmony), proportion (scale). Balance: symmetrical (mirror-image) creates formality and stability; asymmetrical (different elements balanced by visual weight) creates dynamic tension; radial (elements radiating from a centre) creates energy. Contrast: juxtaposing opposing qualities — light against dark, large against small, smooth against rough, complementary colours — to create visual interest and guide the eye. Together: a poster design may use asymmetrical balance to create visual energy, with high contrast between a large dark headline and a light background to draw the viewer's eye to the focal point.",
        commonErrors: [
          "Listing only 3–4 principles.",
          "Describing symmetrical balance as the only type.",
          "Defining contrast only in terms of colour without mentioning size, texture, or shape.",
          "Not giving an example that applies both balance and contrast."
        ]
      },
      {
        question: "Explain the colour wheel and describe the relationships between primary, secondary, and tertiary colours.",
        steps: [
          "Identify the three primary colours.",
          "Explain how secondary colours are made.",
          "Explain how tertiary colours are made.",
          "Describe complementary, analogous, and triadic colour schemes.",
          "Explain warm and cool colour associations."
        ],
        solution: "Primary colours (RYB model): red, yellow, blue — cannot be mixed from other colours. Secondary colours: orange (red + yellow), green (yellow + blue), violet (blue + red). Tertiary colours: mixtures of primary and adjacent secondary — e.g., red-orange, yellow-green, blue-violet. Colour schemes: complementary — colours opposite on the wheel (e.g., red and green) create maximum contrast; analogous — colours adjacent on the wheel (e.g., blue, blue-green, green) create harmony; triadic — three evenly spaced colours (e.g., red, yellow, blue) create balanced vibrancy. Warm colours (red, orange, yellow) advance and create energy; cool colours (blue, green, violet) recede and create calm.",
        commonErrors: [
          "Confusing the RYB colour model (pigment) with the RGB colour model (light).",
          "Mixing up complementary and analogous schemes.",
          "Omitting tertiary colours.",
          "Stating that warm colours are 'always better' — appropriateness depends on design context."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die rol van tipografie in visuele ontwerp en bespreek hoe die keuse van lettertype 'n boodskap beïnvloed.",
        steps: [
          "Definieer tipografie.",
          "Verduidelik die verskil tussen serif- en sans-serif-lettertipes.",
          "Bespreek hoe letterkies toon en persoonlikheid oordra.",
          "Verduidelik beginsels soos hiërargie, spasie, en lyn.",
          "Gee 'n voorbeeld van goeie tipografiese keuses in 'n ontwerp."
        ],
        solution: "Tipografie is die kuns van letterskik en woordpresentasie. Serif-lettertipes (Times New Roman) het klein strepe aan die eindpunte van letters — dit word geassosieer met tradisie, gesag, en leesbaarheid in gedrukte teks. Sans-serif (Arial, Helvetica) is skoon en modern — gebruik in digitale ontwerpe en kontemporêre merkidentiteit. Letterkies oordra persoonlikheid: 'n speelse script-lettertipe op 'n kindergeleentheid-uitnodiging; 'n bold kondenseerde sans-serif op 'n sportsplakkaat. Tipografiese beginsels: hiërargie (onderskei kopteks, subopskrif, liggaamsteks deur grootte en gewig), spasie (ruimte tussen letters, woorde, en lyne verhoog leesbaarheid), uitlijning (links, regs, middel, geregverdig). Voorbeeld: Apple se ontwerpe gebruik eenvoudige, skoon sans-serif tipografie wat sy tech-georiënteerde en elegante merkidentiteit versterk.",
        commonErrors: [
          "Behandel alle lettertipes as dekoratief — tipografie dra funksionele en emosionele betekenis.",
          "Vergeet tipografiese beginsels soos hiërargie en spasie.",
          "Gebruik 'n seriflettertipe en 'n sans-seriflettertipe as onderskeid sonder om te verduidelik wanneer elkeen gebruik word.",
          "Gee geen voorbeeld van goeie tipografieve keuse nie."
        ]
      },
      {
        question: "Verduidelik wat 'n ontwerpgids (design brief) is en watter inligting dit moet bevat.",
        steps: [
          "Definieer 'n ontwerpgids.",
          "Beskryf die kliënt se vereistes en doelstellings.",
          "Verduidelik teikenpubliek en mark.",
          "Noem tegniese spesifikasies.",
          "Verduidelik tydsraamwerk en begroting."
        ],
        solution: "Ontwerpsraamwerk: 'n dokument wat die vereistes, beperkings, en doelstellings van 'n ontwerpopgawe uiteensit, wat as riglyn dien vir die ontwerper. Inhoud: (1) Kliënt-agtergrond en ontwerpvereistes — wat die kliënt wil bereik (doel). (2) Teikenpubliek — wie die ontwerp moet bereik (ouderdom, geslag, belangstellings, kultuur). (3) Boodskap en toon — wat die ontwerp moet kommunikeer (formeel/informeel, energiek/kalm). (4) Tegniese spesifikasies — formaat, afmetings, kleurmodel (CMYK vir druk, RGB vir digitaal), lêerformate. (5) Tydsraamwerk — wanneer konsepte, hersiening, en finale aflewering verwag word. (6) Begroting. 'n Goeie ontwerpsgids voorkom misverstande en stel duidelike sukseskriterium.",
        commonErrors: [
          "Beskryf die gids as bloot 'instruksies om te volg'.",
          "Vergeet die teikenpubliek as kritieke komponent.",
          "Noem nie tegniese spesifikasies nie.",
          "Ignoreer tydsraamwerk en begroting."
        ]
      },
      {
        question: "Bespreek die proses van idee-generering in visuele ontwerp, van breinkraak tot finale konsep.",
        steps: [
          "Definieer die idee-genereringsfase.",
          "Bespreek breinbraking (brainstorming) en mintkaartekaart (mind mapping).",
          "Verduidelik die rol van terugvoer.",
          "Bespreek verfyning van die konsep (iterasies).",
          "Verduidelik hoe om die finale konsep aan die kliënt voor te stel."
        ],
        solution: "Idee-generering is die kreatiewe fase van die ontwerpproses. Breinbraking: kwantiteit bo kwaliteit — soveel idees as moontlik gegenereer sonder selfkritiek. Mintkaartekaart: 'n visuele kaart van verwante konsepte rondom die sentrale ontwerpvraag, wat assosiasies onthul. Skets-verkenning: vinnige ruwe skets van veelvuldige visuele rigtings. Terugvoer: presenteer ruwe idees aan die kliënt of kollegas om rigsnoer te kry en ongepaste rigtings te elimineer. Iterasie: verfyn die mees belowende idees — detail, kleur, tipografie, komposisie. Finale konsep: 'n visueel volledige voorstel wat die idee van die kliënt weerspieël, vergesel deur 'n verduideliking van ontwerpkeuses. Hierdie proses verseker dat kreatiwiteit gedissiplineerd en doelgerig bly.",
        commonErrors: [
          "Spring direk van 'n idee na die finale ontwerp sonder iterasie.",
          "Sê breinbraking is 'net skryf van idees neer' sonder die kwantiteits-bo-kwaliteit-beginsel.",
          "Vergeet die rol van terugvoer van kliënte of kollegas.",
          "Verduidelik nie hoe om die finale konsep voor te stel nie."
        ]
      }
    ]
  },
  "DESIGN-2": {
    workedExamplesEn: [
      {
        question: "Trace the development of a major 20th-century design movement (e.g., Bauhaus or Art Deco) and describe its lasting influence.",
        steps: [
          "State the origins, dates, and founding context of the movement.",
          "Identify key aesthetic principles and visual characteristics.",
          "Name two influential designers or works associated with the movement.",
          "Describe the movement's impact on subsequent design practice.",
          "Give an example of its influence in contemporary design or products."
        ],
        solution: "Bauhaus (Germany, 1919–1933): founded by Walter Gropius in Weimar, the Bauhaus sought to unite fine art and functional craft under a single educational philosophy. Principles: form follows function, industrial production-friendly design, integration of art disciplines, simple geometric forms, primary colours. Key designers: Marcel Breuer (Wassily Chair, 1925 — tubular steel), Herbert Bayer (Universal Typeface). Impact: Bauhaus principles became the foundation of modern graphic design, architecture, product design, and typography — the 'International Style'. Contemporary influence: Apple's product design philosophy (clean lines, functional minimalism) is often cited as Bauhaus-inspired; Swiss modernist typography descends directly from Bauhaus graphic work.",
        commonErrors: [
          "Confusing Bauhaus (functionalist) with Art Nouveau (ornamental).",
          "Omitting dates and founding context.",
          "Not naming specific designers or works.",
          "Failing to connect the historical movement to contemporary examples."
        ]
      },
      {
        question: "Explain the difference between fine art and applied/design art and discuss how the two fields overlap.",
        steps: [
          "Define fine art and its primary purpose.",
          "Define applied/design art and its primary purpose.",
          "List areas where they traditionally differ (intention, audience, function).",
          "Describe areas of overlap (aesthetics, creativity, concept-driven work).",
          "Give an example of a work that straddles both categories."
        ],
        solution: "Fine art is primarily created for aesthetic experience, personal expression, or cultural commentary — its primary audience is the viewer who contemplates it. Applied/design art is created to solve a functional problem (communication, usability, commercial purpose) for a specific audience or client. Differences: fine art has no functional constraint; design art must satisfy a brief and function effectively. Overlap: both require strong aesthetic sensibility, creative problem-solving, and cultural awareness. Contemporary art often borrows design's visual language; design increasingly uses fine art's conceptual depth. Example: Saul Bass's film poster designs for Alfred Hitchcock ('Vertigo', 'Psycho') are functional design objects (promoting a film) that also stand as fine artworks admired independently of their commercial purpose.",
        commonErrors: [
          "Saying design art has no artistic value — it has both functional and aesthetic dimensions.",
          "Treating fine art and design art as completely separate — they have always influenced each other.",
          "Not giving a concrete example that bridges both fields.",
          "Defining fine art only by medium (painting, sculpture) rather than by purpose."
        ]
      },
      {
        question: "Discuss the role of sustainability in contemporary design and give examples of eco-conscious design principles.",
        steps: [
          "Define sustainability in the context of design.",
          "Explain the 'cradle-to-cradle' principle.",
          "Describe material choices that prioritise sustainability.",
          "Discuss reducing waste in design processes.",
          "Give two real examples of sustainable design products or practices."
        ],
        solution: "Sustainability in design means creating products, systems, or communications that minimise environmental harm across their full lifecycle. The cradle-to-cradle principle: design products so all materials can be reused, recycled, or safely returned to the biosphere — eliminating the concept of waste. Material choices: recycled materials, bioplastics, FSC-certified paper for print, low-VOC inks. Reducing waste: digital-first communication (reducing print), modular design (products that can be repaired/upgraded rather than discarded), minimal packaging. Examples: (1) Patagonia's recycled-material outdoor clothing — closed-loop manufacturing. (2) Herman Miller's Aeron chair — designed for 99% recyclability. Sustainable design is increasingly a commercial expectation as consumers and regulators demand environmental responsibility.",
        commonErrors: [
          "Treating sustainability as only about recycling, ignoring materials, energy, and waste reduction.",
          "Not explaining the cradle-to-cradle principle.",
          "Giving no real product or practice examples.",
          "Treating sustainability as a constraint rather than a design opportunity."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik hoe Suid-Afrikaanse kultuur en erfenis visuele ontwerp en kuns beïnvloed het.",
        steps: [
          "Identifiseer twee of meer SA kulturele tradisies wat ontwerp beïnvloed het.",
          "Verduidelik hoe patrone, kleure, en simboliek gebruik word.",
          "Noem 'n SA ontwerper of kunstenaar wat kulturele erfenis inkorporeer.",
          "Bespreek uitdagings van kulturele toe-eiening in ontwerp.",
          "Sluit af met die potensiaal van SA-erfenis in globale ontwerp."
        ],
        solution: "Suid-Afrikaanse kulturele tradisies soos Ndebele geometriese muralskildering (sterk geometriese vorms, helder primêre kleure), Zulu umhlanga-kraalswerk (kleurpatrone met sosiale betekenis), en San rotskunssimboliek het almal invloed op SA visuele ontwerp. Hierdie visuele taal word in tekstiel, sieraad, produkontwerp, en grafika gebruik. SA ontwerper Laduma Ngxokolo (MaXhosa by Laduma) ontwerp gebreide kleding gebaseer op Xhosa kleurpalette en patrone vir 'n internasionale mark — 'n suksesvolle voorbeeld van kulturele erfenis-integrasie. Uitdaging: kulturele toe-eiening — as nie-lede van 'n kultuur kulturele simbole kommersieel gebruik sonder toestemming of begrip, kan dit uitbuitend wees. Die potensiaal: SA se ryk diverse kultuurerfenis bied unieke visuele taal vir internasionale ontwerp wat onderskeidend en eies is.",
        commonErrors: [
          "Noem slegs een kulturele tradisie.",
          "Vergeet om die toe-eieningskwessie te bespreek.",
          "Gee geen spesifieke SA ontwerper of kunstenaar nie.",
          "Beskryf kulturele erfenis se rol in ontwerp net oppervlakkig."
        ]
      },
      {
        question: "Bespreek die ontwerpsproces stap vir stap, van die ontwerpsgids tot die voltooide produk.",
        steps: [
          "Stap 1: Ontwerp-gids en probleemstelling.",
          "Stap 2: Navorsing en analise.",
          "Stap 3: Idee-generering en skets.",
          "Stap 4: Ontwikkeling en verfyning.",
          "Stap 5: Finale ontwerp, aanbieding, en produksie."
        ],
        solution: "Die ontwerpsproces: (1) Gids/probleemstelling — definieer die doel, teikenpubliek, begroting, en tegniese beperkings. (2) Navorsing — analiseer die mark, mededingers, teikenpublieks-voorkeure, en tendense; versamel visuele verwysings (mood board). (3) Idee-generering — breinbraking, mintkaartekaart, vinnige ruwe sketse van veelvuldige rigtings sonder selfkritiek. (4) Ontwikkeling — selekteer en verfyn belowende idees, toets prototipes, versamel terugvoer, itereer. (5) Finale produk — voltooiing van al tegniese spesifikasies, aanbieding aan kliënt, produksie-gereed lêers (CMYK, uitval, korrekte resolusie). Elke stap is siklies — terugvoer in stap 4 kan terugvoer na stap 3 noodsaak.",
        commonErrors: [
          "Sê die proses is lineêr sonder iterasie.",
          "Vergeet die navorsingstap.",
          "Slaan prototipering en terugvoer oor.",
          "Noem nie tegniese produksiespesifikasies in die finale stap nie."
        ]
      },
      {
        question: "Verduidelik die konsep van 'n merkidentiteit (brand identity) en watter ontwerpelement dit gevorm.",
        steps: [
          "Definieer merkidentiteit.",
          "Verduidelik die rol van die logo.",
          "Bespreek kleurpalet en tipografiekeuses.",
          "Verduidelik die rol van toon van stem en beelding.",
          "Gee 'n voorbeeld van 'n sterk merkidentiteit."
        ],
        solution: "Merkidentiteit is die visuele en kommunikatiewe persoonlikheid van 'n organisasie — hoe dit na buite lyk, klink, en voel. Elemente: (1) Logo — die kernvisuele herkenningspunt; eenvoudig, skaleerbaar, veelsydig. (2) Kleurpalet — kleure dra psigologiese en emosionele assosiasies (rooi: energie, blaai: vertroue, groen: natuur/volhoubaarheid). (3) Tipografie — lettertipekeuse versterk persoonlikheid (modern sans-serif vs klassieke serif). (4) Toon van stem — formeel/professioneel vs speels/informeel. (5) Beelding — fotografie of illustrasie-styl konsekwent toegepas. Voorbeeld: Nike — die Swoosh-logo, 'Just Do It'-slagsin, swart/wit kleurpalet, kragtige aksie-beelding, en aktiwiteitsgedrewe toon skep 'n deurlopende en sterk merkidentiteit wat dadelik herkenbaar is.",
        commonErrors: [
          "Behandel merkidentiteit as net 'n logo.",
          "Vergeet kleur, tipografie, en toon van stem.",
          "Gee geen werklike voorbeeld van 'n sterk merk nie.",
          "Noem nie waarom konsekwentheid oor alle platforms belangrik is nie."
        ]
      }
    ]
  },
  "DESIGN-3": {
    workedExamplesEn: [
      {
        question: "Explain the principles of layout design and how grid systems are used in print and digital communication design.",
        steps: [
          "Define layout design and its purpose.",
          "Explain what a grid system is and why it is used.",
          "Describe the components of a grid (columns, gutters, margins, baseline).",
          "Explain how grids create hierarchy and guide the reader's eye.",
          "Give an example of grid use in a newspaper or magazine layout."
        ],
        solution: "Layout design is the arrangement of visual elements (text, images, white space) on a page or screen to communicate information clearly and aesthetically. A grid system is an invisible structure of columns, gutters (spaces between columns), margins, and baseline grids that gives the layout consistency, alignment, and structure. Components: columns (vertical divisions), gutters (breathing space between columns), margins (space around the live area), and baseline grid (horizontal guide for text alignment). Grids establish visual hierarchy by allocating different grid units to different content types — a dominant image spanning multiple columns, a headline in a wide column, body text in narrower columns. Example: a newspaper uses a multi-column grid (typically 5–6 columns) where headlines span multiple columns for hierarchy and body text sits in single columns for readability.",
        commonErrors: [
          "Confusing the grid with the final visible design — grids are guides, not decorative elements.",
          "Omitting gutters and margins from the description.",
          "Not explaining how grids create hierarchy.",
          "Thinking a grid restricts creativity rather than enabling consistency."
        ]
      },
      {
        question: "Describe the design process for creating a logo for a new business, from brief to final deliverable.",
        steps: [
          "Step 1: Understand the brief (business type, values, target audience).",
          "Step 2: Research competitors and visual references.",
          "Step 3: Sketch multiple logo concepts.",
          "Step 4: Develop digital versions and present options.",
          "Step 5: Refine based on feedback and prepare final files."
        ],
        solution: "Step 1 — Brief: understand the business name, industry, values (e.g., innovation, trust, community), target audience (age, preferences), and required deliverables. Step 2 — Research: audit competitor logos, identify visual trends in the industry, collect inspiration (mood board). Step 3 — Sketching: generate 20–30 rough concepts, exploring wordmarks (text-only), lettermarks (initials), pictorial marks (symbols), and combination marks; iterate quickly without committing to detail. Step 4 — Digital development: select 3–5 promising concepts, render in vector software (Adobe Illustrator), present in context (business card, signage mockup). Step 5 — Refinement: incorporate client feedback, finalise colour, typography, spacing; prepare deliverables: vector files (AI, SVG, EPS), rasterised (PNG, JPEG), in full colour, black-and-white, and reversed versions.",
        commonErrors: [
          "Skipping the research phase and going directly to sketching.",
          "Presenting only one logo concept to the client.",
          "Not preparing files in multiple formats (vector and raster).",
          "Ignoring the brief's target audience in design decisions."
        ]
      },
      {
        question: "What is UX (User Experience) design and how does it differ from UI (User Interface) design?",
        steps: [
          "Define UX design and its focus.",
          "Define UI design and its focus.",
          "Explain how UX and UI work together.",
          "Describe the UX research process (user research, personas, user journeys).",
          "Give an example of poor UX and good UX in a digital product."
        ],
        solution: "UX (User Experience) design focuses on the overall experience a user has with a product — how intuitive, efficient, and satisfying it is to achieve a goal. UI (User Interface) design focuses on the visual and interactive elements — buttons, icons, colour schemes, typography, and layout — the 'look and feel'. UX informs what needs to be designed; UI determines how it looks. UX process: user research (interviews, surveys), creating personas (fictional user profiles representing real user needs), mapping user journeys (step-by-step paths through the product), and usability testing. UI follows: applying visual design to the UX structure. Example of poor UX: a banking app where finding the transfer function requires 7 taps and non-intuitive navigation. Good UX: the same function accessible in 2 taps from the home screen, with clear labels and confirmation feedback.",
        commonErrors: [
          "Using UX and UI interchangeably — they are distinct but complementary.",
          "Defining UX only as 'making things look nice' — that is UI.",
          "Omitting user research as a core UX activity.",
          "Not giving a concrete example to illustrate the difference."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die verskil tussen analoog en digitale media in visuele ontwerp en bespreek die voordele van elk.",
        steps: [
          "Definieer analoog media in visuele ontwerp.",
          "Definieer digitale media in visuele ontwerp.",
          "Lys drie voordele van analoog media.",
          "Lys drie voordele van digitale media.",
          "Bespreek wanneer elke medium die beste keuse is."
        ],
        solution: "Analoog media: fisiese media soos verf, pen-en-ink, linosnee, drukwerk — handgemaak en taktiel. Voordele: uniekheid (elke stuk is oorspronklik), taktiele kwaliteit, geen tegnologiese drempel, geskik vir fyn-kuns en handwerk-kontekste. Digitale media: sagteware (Illustrator, Photoshop, Figma) en digitale uitsette — skaalbaar en herhaalbaar. Voordele: onbeperkte ongedaan-maak (undo), maklik herhaalbaar en versender aan kliënte, skaalbaar sonder kwaliteitsverlies (vektorgrafika), wyd toeganklik op verskeie platforms. Wanneer analoog: fyn-kuns ontwerp, handgemaak-estetiese merke, persoonlike uitnodigings. Wanneer digitaal: korporatiewe ontwerp, webontwerp, omvangryke produksieprojekte. Baie ontwerpers gebruik albei — begin analoog met skets, voltooi digitaal.",
        commonErrors: [
          "Sê digitale media is altyd beter — analoog het unieke voordele.",
          "Vergeet die kombinasie-benadering (skets analoog, voltooi digitaal).",
          "Lys slegs een of twee voordele per medium.",
          "Gee geen voorbeelde van wanneer elkeen gebruik word nie."
        ]
      },
      {
        question: "Bespreek die rol van die teikenmark in ontwerpbeslissings en hoe ontwerpers teikenpublieks-navorsing doen.",
        steps: [
          "Definieer teikenmark in die konteks van ontwerp.",
          "Verduidelik waarom kennis van die teikenmark noodsaaklik is.",
          "Beskryf navorsingsmetodes (opnames, fokusgroepe, demografiese data).",
          "Verduidelik hoe navorsingsbevindings ontwerpkeuses beïnvloed.",
          "Gee 'n voorbeeld van hoe 'n verskillende teikenmark dieselfde produk anders sal laat lyk."
        ],
        solution: "Teikenmark: die spesifieke groep mense vir wie die ontwerp bedoel is, gedefinieer deur ouderdom, geslag, inkomste, kultuur, belang, en gedrag. Kennis van die teikenmark bepaal kleurkeuses, tipografie, beeldstyl, boodskaptoon, en medium. Navorsingsmetodes: opnames (kwantitatiewe data), fokusgroepe (kwalitatiewe insigte), sosiale media-analise, demografiese marknavorsingverslae, en gebruikerstesting (vir digitale produkte). Bevindings-invloed: 'n jeugmark sal baat by helder kleure, informele tipografie, en sosiale media-aanpassings; 'n professionele B2B-mark sal baat by ingetoë kleure, formele tipografie, en gedetailleerde inligting. Voorbeeld: 'n energiedrank vir jeugdige atlete — helder neon-kleure, dramatiese aksie-beelding, bold sans-serif; dieselfde drank gerig op ouer volwassenes — gedempte kleure, sterk teksinhoud oor voordele, professionele fotografiestyl.",
        commonErrors: [
          "Sê die ontwerper se persoonlike voorkeur is die belangrikste faktor.",
          "Vergeet om navorsingsmetodes te noem.",
          "Noem nie hoe navorsingsbevindings spesifieke ontwerpkeuses beïnvloed nie.",
          "Gee geen voorbeeld van hoe verskillende markte verskillende ontwerpe benodig nie."
        ]
      },
      {
        question: "Verduidelik wat fotografie as 'n kommunikasiemiddel in ontwerp beteken en hoe fotookies op kommunikasieboodskap beïnvloed.",
        steps: [
          "Verduidelik die rol van fotografie in visuele kommunikasie.",
          "Bespreek hoe camerahoek (perspektief) betekenis oordra.",
          "Bespreek hoe beligting toon beïnvloed.",
          "Bespreek hoe keuse van onderwerp and samestelling die fokus stuur.",
          "Gee 'n voorbeeld van hoe dieselfde onderwerp verskillend gefotografeer kan word vir verskillende boodskappe."
        ],
        solution: "Fotografie is een van die kragtigste visuele kommunikasiemiddels in ontwerp — 'n enkele foto kan emosie oordra, 'n produk aanpryse, of 'n storie vertel. Kamerahoek: 'n lae hoek (looking up at subject) skep magtigheid en status; 'n hoë hoek (looking down) skep kwesbaar of klein gevoel; 'n oogvlak-hoek skep gelykheid en kontak. Beligting: egalige deurskynende lig (softbox) skep skoon, professionele uitvoering; harde kontraslig skep drama en spanning; warme lig skep warmte en geselskapelikheid. Samestelling: die rule of thirds stuur die kyker se oog; negatiewe ruimte skep konteks; nabye besnoeiing skep intimiteit of intensiteit. Voorbeeld: 'n produk-foto van koffie vir 'n premium merk — donker agtergrond, harde kontraslig, lae hoek, close-up van stoom — skep luukse en begeerte; dieselfde koffie op 'n familiefoto — warm beligting, oogvlak, glimlaggende gesigge — skep warmte en gemeenskap.",
        commonErrors: [
          "Sê fotografie in ontwerp is slegs dekoratief.",
          "Verduidelik nie hoe spesifieke fotograafikkeuses die boodskap verander nie.",
          "Noem nie kamerahoek, beligting, én samestelling nie.",
          "Gee geen kontrasterende voorbeeld van dieselfde onderwerp nie."
        ]
      }
    ]
  },
  "DESIGN-4": {
    workedExamplesEn: [
      {
        question: "Explain the principles of environmental design and how designers create functional and aesthetic public spaces.",
        steps: [
          "Define environmental/spatial design.",
          "List the key principles: functionality, safety, accessibility, aesthetics, context.",
          "Explain how wayfinding systems guide users through spaces.",
          "Discuss the role of materials, light, and scale.",
          "Give an example of a well-designed public space."
        ],
        solution: "Environmental design creates physical spaces — interiors, streetscapes, signage systems, parks — that are both functional and experiential. Key principles: functionality (the space must serve its intended purpose efficiently), safety (clear sightlines, non-slip surfaces, adequate lighting), accessibility (universal design accommodating all abilities — ramps, tactile paths, Braille signage), aesthetics (visual harmony with the cultural and architectural context), and context (respecting the surrounding environment and community identity). Wayfinding: a system of signs, landmarks, maps, and colour coding that guides users intuitively through complex spaces (airports, hospitals, universities). Materials, light, and scale: warm materials and natural light create welcoming spaces; large-scale artwork at human-eye level creates connection; appropriate scale prevents spaces feeling overwhelming. Example: Singapore's Gardens by the Bay — environmental design integrating ecology, art, architecture, and wayfinding in a cohesive public experience.",
        commonErrors: [
          "Defining environmental design as only interior design.",
          "Omitting accessibility as a core principle.",
          "Not explaining wayfinding as a distinct design discipline.",
          "Giving no real example of a well-designed public space."
        ]
      },
      {
        question: "Describe the field of industrial/product design and explain the relationship between form and function.",
        steps: [
          "Define industrial/product design.",
          "Explain the 'form follows function' principle (Louis Sullivan/modernism).",
          "Discuss how aesthetics enhance functional products.",
          "Describe the role of ergonomics in product design.",
          "Give an example of a product that successfully balances form and function."
        ],
        solution: "Industrial/product design is the professional practice of designing manufactured objects — from furniture to electronics to medical devices. 'Form follows function' (attributed to architect Louis Sullivan): the shape of a designed object should be determined primarily by its intended function. In modernist design, ornament for its own sake is rejected; a well-designed kettle has a handle that fits the hand and a spout that pours without dripping — these functional requirements determine its form. However, aesthetics add value: Apple's iPhone is functionally a computing device, but its sleek visual design creates emotional desirability. Ergonomics: design that fits the human body — grip size, button placement, weight distribution — reduces fatigue and errors. Example: OXO Good Grips kitchen tools — designed for people with arthritis (ergonomic grip), but aesthetically refined enough for mainstream appeal.",
        commonErrors: [
          "Stating form follows function means products must be ugly.",
          "Omitting ergonomics from product design principles.",
          "Not giving a concrete product example.",
          "Confusing industrial design (mass production) with artisan craft (one-off objects)."
        ]
      },
      {
        question: "Explain what packaging design is and describe its primary functions beyond containing a product.",
        steps: [
          "Define packaging design.",
          "Describe the protection function.",
          "Describe the communication/branding function.",
          "Describe the differentiation function (on shelf).",
          "Describe the sustainability considerations in modern packaging design."
        ],
        solution: "Packaging design is the creation of the exterior of a product — structure, materials, graphics, and typography — that houses, protects, and communicates the product to the consumer. Functions: (1) Protection — physical protection during transport and storage (materials, structural integrity). (2) Communication/branding — conveys brand identity, product information, ingredients/instructions, legal requirements. (3) Differentiation — stands out at point-of-sale through colour, shape, and visual identity; a distinctive silhouette (like a Coca-Cola bottle) is instantly recognisable. (4) Experience — the unboxing experience (e.g., Apple's product packaging) is itself a designed brand touchpoint. (5) Sustainability: reduce material use, design for recyclability, use sustainable materials, eliminate single-use plastics. Modern packaging design balances all five functions while meeting cost and manufacturing constraints.",
        commonErrors: [
          "Defining packaging design as only about appearance.",
          "Omitting the sustainability dimension.",
          "Not mentioning the communication function (ingredients, legal text, brand identity).",
          "Failing to mention the on-shelf differentiation role."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die konsep van visuele hiërargie in ontwerp en wys hoe dit deur grootte, kleur, en plaasing geskep word.",
        steps: [
          "Definieer visuele hiërargie.",
          "Verduidelik hoe grootte hiërargie skep.",
          "Verduidelik hoe kleur aandag trek.",
          "Verduidelik hoe plaasing (bo, middel, onder) die oog lei.",
          "Gee 'n voorbeeld van 'n ontwerp met duidelike visuele hiërargie."
        ],
        solution: "Visuele hiërargie is die rangskikking van ontwerpelement volgens hul belang, sodat die kyker instinktief die mees belangrike inligting eerste lees. Grootte: groter elemente trek eerste aandag — 'n groot kopteks bo-aan 'n plakkaat word voor die subopskrif gelees. Kleur: helder, kontrasterende kleure trek die oog; 'n rooi 'koop nou'-knoppie teen 'n wit agtergrond is instinktief visueel eerste. Plaasing: in Westerse lees-kulture beweeg die oog van bo-links na regs-onder (F-patroon); mees kritiese inligting behoort bo of links. Witruimte rondom 'n element beklemtoon dit en trek fokus. Voorbeeld: 'n tydskrifoorkant — titel groots bo (eerste gelees), inhoud-soekopdragte middel (tweede), webtuiste of datum klein onder (laaste) — skep duidelike hiërargie.",
        commonErrors: [
          "Sê visuele hiërargie is net oor grootte.",
          "Vergeet die rol van kleur én plaasing.",
          "Gee geen konkrete ontwerpsvoorbeeld nie.",
          "Noem nie witruimte as 'n hiërargie-hulpmiddel nie."
        ]
      },
      {
        question: "Bespreek die etiese verantwoordelikhede van 'n ontwerper teenoor kliënte, gebruikers, en die gemeenskap.",
        steps: [
          "Definieer etiese verantwoordelikheid in ontwerp.",
          "Bespreek eerlikheid in advertensies en kommunikasie.",
          "Bespreek die verantwoordelikheid om nie te manipuleer nie.",
          "Noem omgewingsverantwoordelikheid.",
          "Bespreek inklusiwiteit en toeganklikheid."
        ],
        solution: "Ontwerpers het 'n unieke mag om persepsie te vorm, aandag te lei, en gedrag te beïnvloed — daarmee kom etiese verantwoordelikheid. Eerlikheid: ontwerpers moet nie misleidende advertensies ontwerp nie (bv. vals vóór-en-ná-beelde, misleidende grootte-aanduidings). Manipulasie: donker ontwerpspatrone (e.g., kansellering wat moeilik is om te vind, vals mededingingstellers) ontwerp opsetlik verbruikerservarings om hulle teen hul belang te mislei — dit is oneties. Omgewingsverantwoordelikheid: kies volhoubare materiale en produksiemetodes; weier opdragte wat onnodige wegwerpprodukte of skadelike verpakking bevorder. Inklusiwiteit: ontwerp vir alle gebruikers — voldoende kleurkontraste vir kleurblinde, teksal vir beelde vir blindes, toeganklike tipografie. Gemeenskapsdiens: ontwerp kan 'n mag vir sosiale goed wees — veldtogte vir openbare gesondheid, omgewing, of gelykheid.",
        commonErrors: [
          "Behandel etiese verantwoordelikheid as opsioneel of net oor die kliënt.",
          "Vergeet omgewingsverantwoordelikheid.",
          "Noem nie inklusiwiteit en toeganklikheid nie.",
          "Gee geen konkrete voorbeeld van onetiese of etiese ontwerppraktyk nie."
        ]
      },
      {
        question: "Verduidelik die konsep van 'n moodboard en hoe dit in die ontwerpproses gebruik word.",
        steps: [
          "Definieer 'n moodboard.",
          "Verduidelik watter tipe visuele elemente dit bevat.",
          "Beskryf hoe dit die ontwerper help om rigting te definieer.",
          "Verduidelik hoe dit met die kliënt gekommunikeer word.",
          "Noem die verskil tussen 'n styl-moodboard en 'n inhoud-moodboard."
        ],
        solution: "Moodboard: 'n visuele collage van beelde, kleure, teksture, tipografie, en soms tekste wat die estetiek, toon, en rigting van 'n ontwerpsprojek definieer. Inhoud: inspirasie-beelde (fotografie, illustrasie), kleurpalette, lettertipe-monster, patroon- en teksuurstale, verwysende ontwerpe. Gebruik: die ontwerper organiseer 'n moodboard vroeg in die projek om die kreatiewe rigting te definieer en te verfyn — dit voorkom dat die ontwerp in die verkeerde rigting gaan. Kliëntkommunikasie: 'n moodboard word aan die kliënt aangebied vóór die eintlike ontwerp om te bevestig dat albei party dieselfde visie het — dit bespaar hersienings later. Verskil: styl-moodboard fokus op estetika en toon; inhoud-moodboard fokus op wat die ontwerp moet oordra (onderwerpe, beelde, stories). In praktyk oorvleuel hulle dikwels.",
        commonErrors: [
          "Beskryf 'n moodboard as die finale ontwerp.",
          "Sê dit bevat slegs foto's — dit bevat ook kleure, tipografie, en teksture.",
          "Vergeet dat dit 'n kommunikasiemiddel met die kliënt is.",
          "Noem nie die verskil tussen styl- en inhoud-moodboards nie."
        ]
      }
    ]
  },
  "DESIGN-5": {
    workedExamplesEn: [
      {
        question: "Explain what surface design is and describe how pattern and texture are applied to textiles and fashion.",
        steps: [
          "Define surface design.",
          "Describe how pattern is created (repeat structures: block, half-drop, mirror).",
          "Describe how texture is achieved in textiles (weave structure, embellishment).",
          "Explain how surface design communicates meaning or identity.",
          "Give an example of surface design in South African fashion."
        ],
        solution: "Surface design refers to the creation of images, patterns, and textures on the surface of materials — primarily textiles. Pattern: a motif repeated in a structured arrangement. Repeat structures: block repeat (motifs arranged in a grid), half-drop repeat (each column offset by half a unit, creating diagonal flow), mirror repeat (motifs reflected). Texture in textiles: achieved through weave structure (plain, twill, satin), pile (velvet, corduroy), embellishment (embroidery, beading, quilting). Surface design communicates cultural identity, social status, or aesthetics — Shweshwe (three-cats fabric) is a distinctly South African surface design with cultural significance in Xhosa, Sotho, and Tswana communities. Example: Cape Town designer Sun Goddess integrates African wax-print patterns into contemporary fashion for global markets.",
        commonErrors: [
          "Confusing surface design with garment construction.",
          "Listing only one type of repeat pattern.",
          "Not explaining how surface design carries cultural meaning.",
          "Omitting texture as a dimension of surface design."
        ]
      },
      {
        question: "Discuss the role of fashion design in expressing cultural identity and social commentary.",
        steps: [
          "Explain how clothing communicates cultural identity.",
          "Describe two historical examples of fashion as social commentary.",
          "Discuss contemporary fashion designers who use their work for social messaging.",
          "Explain how South African fashion designers engage with cultural identity.",
          "Reflect on the tension between tradition and modernity in fashion."
        ],
        solution: "Clothing has always communicated cultural identity — traditional dress (Ndebele beadwork, Scottish tartan, Japanese kimono) signals belonging, status, and beliefs. Fashion as social commentary: (1) 1960s miniskirt (Mary Quant) — challenged conservative gender norms and symbolised female liberation. (2) Punk fashion (1970s UK) — deliberately anti-establishment: ripped clothing, safety pins, shocking colours as protest against mainstream society. Contemporary: Vivienne Westwood used her platform to campaign for environmental sustainability; Stella McCartney refuses to use leather or fur. South African: Rich Mnisi draws on Tsonga cultural aesthetics; MaXhosa by Laduma Ngxokolo re-imagines Xhosa beadwork in luxury knitwear. Tension: traditional fashion evolves through fusion with global trends — this can enrich or dilute cultural identity depending on the designer's approach and community's reception.",
        commonErrors: [
          "Treating fashion as only aesthetic without cultural or social dimensions.",
          "Giving only one historical example.",
          "Not mentioning South African fashion designers.",
          "Ignoring the tradition-modernity tension."
        ]
      },
      {
        question: "Explain the concept of 'design for social good' and give two examples of design solving a social problem.",
        steps: [
          "Define design for social good.",
          "Explain how design thinking can address social challenges.",
          "Give example 1 — a product or system designed for social impact.",
          "Give example 2 — a second product/system from a different domain.",
          "Reflect on the designer's responsibility to consider social impact."
        ],
        solution: "Design for social good refers to applying design skills and thinking to address social, environmental, or humanitarian challenges rather than purely commercial ones. Design thinking process: empathise with the users' real problem, define the challenge, ideate solutions, prototype, test. Example 1: IDEO's Aquaduct bicycle (2008) — a water-transport tricycle designed for communities without clean water access; the pedalling motion filters water during the journey — a design that reduces women's labour burden and improves health. Example 2: The Life Straw — a portable water filtration device that purifies water as you drink through it, designed for disaster relief and communities without sanitation infrastructure. Designer's responsibility: design is not neutral; every designed object has social and environmental impact. Designers must consider accessibility, cultural appropriateness, and unintended consequences of their work.",
        commonErrors: [
          "Defining design for social good only as charity work or pro-bono design.",
          "Not explaining the design thinking process behind social design.",
          "Giving examples that are commercial products with minor social benefit rather than purpose-designed for social impact.",
          "Not reflecting on the designer's broader social responsibility."
        ]
      }
    ],
    workedExamplesAf: [
      {
        question: "Verduidelik die beginsels van modeontwerpbeginsels en hoe sny en siluet 'n kledingstuk definieer.",
        steps: [
          "Definieer siluet in modeontworp.",
          "Beskryf die hoofsiluette (A-lyn, H-lyn, X-lyn, O-lyn).",
          "Verduidelik hoe sny (tailoring/draping) die siluet skep.",
          "Bespreek hoe siluet liggaamsproporsies beklemtoon of verberg.",
          "Gee 'n voorbeeld van 'n mode-ontwerper bekend vir 'n unieke siluet."
        ],
        solution: "Siluet is die algehele buitelyn van 'n kledingstuk teen die agtergrond — dit is die eerste visuele element wat 'n kyker waarneem. Hoofsiluette: A-lyn (smal by die skouer, wyd by die onderkant), H-lyn (reguit van skouer tot heup, geen verspeling nie), X-lyn (pas by die bors, ingetrekte middel, wyd by die heup — uurglassiluet), O-lyn (kokoonvorm, wyd in die middel). Sny: hoe die stof gesny en saamgenaai word bepaal hoe dit die liggaam omsit — strukturele sny skep gedefinieerde vorms; draping (stof oor die standvastig gedrapeer) skep vloeiende vorms. Siluet kan verhoudinge wysig: 'n A-lyn rokkie by die heup-vlak trek aandag weg van die heupe. Voorbeeld: Christian Dior se 'New Look' (1947) — 'n gedefineerde X-siluet wat sterk kontrasteer met die minimalistiese warskoringstydperk.",
        commonErrors: [
          "Verduidelik siluet sonder om spesifieke siluet-tipes te noem.",
          "Noem nie hoe sny die siluet bewerkstellig nie.",
          "Behandel alle siluette as dieselfde.",
          "Gee geen voorbeeld van 'n bekende ontwerper nie."
        ]
      },
      {
        question: "Bespreek hoe modeveranderings (trends) ontstaan en versprei word in die mode-industrie.",
        steps: [
          "Verduidelik wat 'n modetendens is.",
          "Beskryf hoe tendense op die catwalk begin.",
          "Bespreek die rol van sosiale media en mede-beïnvloeders ('influencers').",
          "Verduidelik die 'dripper-down'-model en 'dripper-up'-model.",
          "Noem die siklus van 'n tendens (inleiding, groei, hoogtepunt, verval)."
        ],
        solution: "Modetendens: 'n spesifieke styl, kleur, of silhoëtte wat deur 'n beduidende deel van die mode-industrie en verbruikers vir 'n beperkte tyd aanvaar word. Catwalk (hoë mode): internasionale modehuise (Parys, Milaan, New York, Londen Fashion Weeks) stel nuwe tendense voor; mode-redakteurs en -kopers kies dan watter tendense in winkels sal verskyn. Sosiale media: Instagram, TikTok, en mode-beïnvloeders kan 'n niche-tendens vinnig tot 'n grootskaalse tendens verander sonder die tradisionele catwalk-kanaal. Druppel-af-model (trickle-down): hoë-mode tendense druppel af na massahandelaars (Zara, H&M). Druppel-op-model (trickle-up): straatmode tendense (bv. sneaker-kultuur, sportkleding) beweeg op na hoë mode. Tendenssiklus: bekendstelling → vroeë aanname → massa aanname → versadiging → verval → neus-te-neus.",
        commonErrors: [
          "Sê tendense word slegs deur hoë-mode skeppers bepaal — sosiale media en straatmode het gesag verskuif.",
          "Noem nie albei die druppel-af en druppel-op modelle nie.",
          "Verduidelik nie die tendenssiklus nie.",
          "Gee geen voorbeeld van 'n spesifieke tendens nie."
        ]
      },
      {
        question: "Verduidelik die plek van Suid-Afrikaanse mode in die wêreldmark en noem twee SA modeontwerpers wat internasionaal erken word.",
        steps: [
          "Beskryf die huidige status van die SA mode-industrie.",
          "Verduidelik wat SA mode onderskei (kulturele erfenis, klimaat, materiale).",
          "Noem ontwerper 1 en sy/haar bydrae.",
          "Noem ontwerper 2 en sy/haar bydrae.",
          "Bespreek uitdagings en geleenthede vir SA mode-ontwerpers wêreldwyd."
        ],
        solution: "Suid-Afrikaanse mode het in die afgelope twee dekades beduidend gegroei en erkenning op internasionale platforms gekry. SA mode word onderskei deur unieke kulturele erfenis (Ndebele, Xhosa, Zulu, Sotho visuele tradisies), diverse klimaat (tropiese kuslyn tot bergklimaat), en plaaslike materiale (mohair, Shweshwe-stof). Ontwerper 1: Laduma Ngxokolo (MaXhosa by Laduma) — herontwerp Xhosa culturele beadwork-patrone in luukse gebreide kleding; het vir internasionale modeplatforms by New York Fashion Week vertoon. Ontwerper 2: David Tlale — bekend vir dramaticse en kontemporêre Afrika-geïnspireerde ontwerpe; het by Paris Fashion Week vertoon. Uitdagings: beperkte toegang tot internasionale markte, infrastruktuur, en befondsing. Geleenthede: groeiende waardering vir Afrika-erfenis-gebaseerde luukse; e-handel wat grense oorbrug.",
        commonErrors: [
          "Sê SA mode het geen internasionale teenwoordigheid nie.",
          "Noem nie die kulturele erfenis-aspek wat SA mode onderskei nie.",
          "Gee nie twee spesifieke ontwerpers met hul spesifieke bydraes nie.",
          "Ignoreer uitdagings en geleenthede."
        ]
      }
    ]
  }
};
