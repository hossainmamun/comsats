(function(){'use strict';const matricObtained=document.getElementById('comsat-calc-matric-obtained');const matricTotal=document.getElementById('comsat-calc-matric-total');const interObtained=document.getElementById('comsat-calc-inter-obtained');const interTotal=document.getElementById('comsat-calc-inter-total');const ntsObtained=document.getElementById('comsat-calc-nts-obtained');const ntsTotal=document.getElementById('comsat-calc-nts-total');const ruleSelect=document.getElementById('comsat-calc-rule');const calculateBtn=document.getElementById('comsat-calc-calculate');const errorContainer=document.getElementById('comsat-calc-error');const resultSection=document.getElementById('comsat-calc-result-section');const resultSummary=document.getElementById('comsat-calc-result-summary');const resultActions=document.getElementById('comsat-calc-result-actions');const pdfBtn=document.getElementById('comsat-calc-pdf');const copyBtn=document.getElementById('comsat-calc-copy');const resetBtn=document.getElementById('comsat-calc-reset');const RULE_SETS={standard:{name:'Standard (Matric 10% - Inter 40% - Entry Test 50%)',weights:{matric:10,inter:40,test:50,},},};function saveToSession(data){try{sessionStorage.setItem('comsatCalcData',JSON.stringify(data))}catch(e){console.warn('Unable to save session data:',e)}}
function loadFromSession(){try{const raw=sessionStorage.getItem('comsatCalcData');return raw?JSON.parse(raw):undefined}catch(e){console.warn('Unable to load session data:',e);return undefined}}
function restoreSession(){const data=loadFromSession();if(!data)return;if(typeof data.matricObtained==='number')matricObtained.value=data.matricObtained;if(typeof data.matricTotal==='number')matricTotal.value=data.matricTotal;if(typeof data.interObtained==='number')interObtained.value=data.interObtained;if(typeof data.interTotal==='number')interTotal.value=data.interTotal;if(typeof data.ntsObtained==='number')ntsObtained.value=data.ntsObtained;if(typeof data.ntsTotal==='number')ntsTotal.value=data.ntsTotal;if(data.ruleKey)ruleSelect.value=data.ruleKey;if(data.result){resultSummary.innerHTML=data.result.html;resultSection.hidden=!1;resultActions.hidden=!1}}
function validateInputs(){const mObt=parseFloat(matricObtained.value);const mTot=parseFloat(matricTotal.value);const iObt=parseFloat(interObtained.value);const iTot=parseFloat(interTotal.value);const tObt=parseFloat(ntsObtained.value);const tTot=parseFloat(ntsTotal.value);if(isNaN(mObt)||isNaN(mTot)||isNaN(iObt)||isNaN(iTot)||isNaN(tObt)||isNaN(tTot)){return{error:'Please fill in all fields with valid numbers.'}}
if(mObt<0||mTot<=0||iObt<0||iTot<=0||tObt<0||tTot<=0){return{error:'Marks must be non‑negative and total must be greater than zero.'}}
if(mObt>mTot){return{error:'Obtained Matric marks cannot exceed total Matric marks.'}}
if(iObt>iTot){return{error:'Obtained Intermediate marks cannot exceed total Intermediate marks.'}}
if(tObt>tTot){return{error:'Obtained NTS marks cannot exceed total NTS marks.'}}
return{values:{matric:{obtained:mObt,total:mTot},inter:{obtained:iObt,total:iTot},test:{obtained:tObt,total:tTot},},}}
function calculateMerit(values,ruleKey){const rule=RULE_SETS[ruleKey];if(!rule)throw new Error('Invalid rule set');const weights=rule.weights;function percentage(obt,tot){return(obt/tot)*100}
function round(num){return Math.round(num*100)/100}
const matricPerc=percentage(values.matric.obtained,values.matric.total);const interPerc=percentage(values.inter.obtained,values.inter.total);const testPerc=percentage(values.test.obtained,values.test.total);const matricContribution=(matricPerc*weights.matric)/100;const interContribution=(interPerc*weights.inter)/100;const testContribution=(testPerc*weights.test)/100;const totalAggregate=matricContribution+interContribution+testContribution;return{percentages:{matric:round(matricPerc),inter:round(interPerc),test:round(testPerc),},contributions:{matric:round(matricContribution),inter:round(interContribution),test:round(testContribution),},total:round(totalAggregate),weights:{...weights},}}
function buildResultSummary(calcResult,values,ruleName){const date=new Date();const{percentages,contributions,total,weights}=calcResult;const html=`
    <div class="comsat-calc-result-meta">
      <p class="comsat-calc-result-meta-rule"><strong>Rule Set:</strong> <span>${ruleName}</span></p>
      <p class="comsat-calc-result-meta-point"><strong>Final Aggregate:</strong> <span class="final-aggregate">${total}%</span></p>
    </div>
    <table>
      <thead>
        <tr>
          <th>Component</th>
          <th>Marks (Obtained / Total)</th>
          <th>Percentage</th>
          <th>Weight</th>
          <th>Contribution</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td data-label="Component">Matric/O‑Level</td>
          <td data-label="Marks">${values.matric.obtained} / ${values.matric.total}</td>
          <td data-label="Percentage">${percentages.matric}%</td>
          <td data-label="Weight">${weights.matric}%</td>
          <td data-label="Contribution">${contributions.matric}%</td>
        </tr>
        <tr>
          <td data-label="Component">Intermediate/FSc</td>
          <td data-label="Marks">${values.inter.obtained} / ${values.inter.total}</td>
          <td data-label="Percentage">${percentages.inter}%</td>
          <td data-label="Weight">${weights.inter}%</td>
          <td data-label="Contribution">${contributions.inter}%</td>
        </tr>
        <tr>
          <td data-label="Component">NTS/Entry Test</td>
          <td data-label="Marks">${values.test.obtained} / ${values.test.total}</td>
          <td data-label="Percentage">${percentages.test}%</td>
          <td data-label="Weight">${weights.test}%</td>
          <td data-label="Contribution">${contributions.test}%</td>
        </tr>
        <tr class="total-row">
          <td colspan="4" data-label="Final Aggregate"><strong>Final Aggregate</strong></td>
          <td data-label="Aggregate Value"><strong>${total}%</strong></td>
        </tr>
      </tbody>
    </table>
  `;const textLines=[];textLines.push('COMSATS Merit Calculation');textLines.push(`Rule Set: ${ruleName}`);textLines.push('');textLines.push(`Matric/O-Level: ${values.matric.obtained}/${values.matric.total} -> ${percentages.matric}% (Weight ${weights.matric}%) => ${contributions.matric}%`);textLines.push(`Intermediate/FSc: ${values.inter.obtained}/${values.inter.total} -> ${percentages.inter}% (Weight ${weights.inter}%) => ${contributions.inter}%`);textLines.push(`NTS/Entry Test: ${values.test.obtained}/${values.test.total} -> ${percentages.test}% (Weight ${weights.test}%) => ${contributions.test}%`);textLines.push('');textLines.push(`Final Aggregate: ${total}%`);textLines.push('');textLines.push('Disclaimer: Please verify rules and weights with official sources.');return{html:html,text:textLines.join('\n'),}}
async function generatePDF(summary){if(!window.jspdf||!window.jspdf.jsPDF){alert('PDF generation library failed to load. Please check your internet connection.');return}
const{jsPDF}=window.jspdf;const doc=new jsPDF();const margin=15;let y=margin;const lineHeight=8;const lines=doc.splitTextToSize(summary.text,180);lines.forEach((line)=>{doc.text(line,margin,y);y+=lineHeight;if(y>280){doc.addPage();y=margin}});doc.save('comsats-merit-result.pdf')}
async function copyToClipboard(text){try{await navigator.clipboard.writeText(text);const original=copyBtn.textContent;copyBtn.textContent='Copied!';setTimeout(()=>{copyBtn.textContent=original},1500)}catch(e){alert('Unable to copy to clipboard.')}}
function resetCalculator(){matricObtained.value='';matricTotal.value='';interObtained.value='';interTotal.value='';ntsObtained.value='';ntsTotal.value='';errorContainer.textContent='';resultSummary.innerHTML='';resultSection.hidden=!0;resultActions.hidden=!0;saveToSession({})}
function handleCalculate(){errorContainer.textContent='';const validation=validateInputs();if(validation.error){errorContainer.textContent=validation.error;resultSection.hidden=!0;resultActions.hidden=!0;saveToSession({});return}
const values=validation.values;const ruleKey=ruleSelect.value;const rule=RULE_SETS[ruleKey];if(!rule){errorContainer.textContent='Invalid rule selected.';return}
const calcResult=calculateMerit(values,ruleKey);const summary=buildResultSummary(calcResult,values,rule.name);resultSummary.innerHTML=summary.html;resultSection.hidden=!1;resultActions.hidden=!1;saveToSession({matricObtained:values.matric.obtained,matricTotal:values.matric.total,interObtained:values.inter.obtained,interTotal:values.inter.total,ntsObtained:values.test.obtained,ntsTotal:values.test.total,ruleKey:ruleKey,result:summary,})}
function attachEventListeners(){[matricObtained,matricTotal,interObtained,interTotal,ntsObtained,ntsTotal,ruleSelect].forEach((el)=>{el.addEventListener('input',()=>{saveToSession({matricObtained:parseFloat(matricObtained.value)||0,matricTotal:parseFloat(matricTotal.value)||0,interObtained:parseFloat(interObtained.value)||0,interTotal:parseFloat(interTotal.value)||0,ntsObtained:parseFloat(ntsObtained.value)||0,ntsTotal:parseFloat(ntsTotal.value)||0,ruleKey:ruleSelect.value,})})});calculateBtn.addEventListener('click',handleCalculate);pdfBtn.addEventListener('click',()=>{const data=loadFromSession();if(data&&data.result){generatePDF(data.result)}});copyBtn.addEventListener('click',()=>{const data=loadFromSession();if(data&&data.result){copyToClipboard(data.result.text)}});resetBtn.addEventListener('click',resetCalculator)}
restoreSession();attachEventListeners()})()
