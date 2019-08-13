const contractSource = `
contract JobPortal =
  
  record job =
    { clientAddress : address,
      name          : string,
      email         : string,
      link          : string,
      category      : string,
      details       : string,
      amount        : int }
      
  record state =
    { jobs      : map(int, job),
      jobsLength : int }
      
  entrypoint init() =
    { jobs = {},
      jobsLength = 0 }
      
  entrypoint get_job(index : int) : job =
    switch(Map.lookup(index, state.jobs))
      None    => abort("There was no job with this index registered.")
      Some(x) => x
      
  stateful entrypoint register_job(name' : string, email' : string, link' : string, category' : string, details' : string) =
    let job = { clientAddress = Call.caller, name = name', email = email', link = link', category = category', details = details', amount = 0}
    let index = get_jobs_length() + 1
    put(state{ jobs[index] = job, jobsLength = index })
    
  entrypoint get_jobs_length() : int =
    state.jobsLength
`;

const contractAddress = 'ct_pVCPrhvPNaEPVgMm1Aiv2n7qqaoG9zugZMpXmzbzDSieuD6FH';
var client = null;
var applyArray = [];

async function contractCall(func, args, value) {
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  const calledSet = await contract.call(func, args, {amount: value}).catch(e => console.error(e));

  return calledSet;
}

window.addEventListener('load', async () => {
  client = await Ae.Aepp();
});

$('#applicationBtn').click(async function(){
  $("#loader").show();
  const name = ($('#input-name').val()),
        email = ($('#input-email').val()),
        link = ($('#input-link').val()),
        category = ($('#input-jobRole').val()),
        details = ($('#input-aboutYourself').val());

  await contractCall('register_job', [name, email, link, category, details], 0);

  applyArray.push({
    name: name,
    email: email,
    link: link,
    category: category,
    details: details,
  })

  $("#loader").hide();
});