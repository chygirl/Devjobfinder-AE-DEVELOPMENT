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
var jobsLength = 0;

function renderJobs() {
  let template = $('#applyJS').html();
  Mustache.parse(template);
  let rendered = Mustache.render(template, {applyArray});
  $('#appliedJobs').html(rendered);
}

async function callStatic(func, args) {
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  const calledGet = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));
  const decodedGet = await calledGet.decode().catch(e => console.error(e));

  return decodedGet;
}

window.addEventListener('load', async () => {
  $("#loader").show();

  client = await Ae.Aepp();

  jobsLength = await callStatic('get_jobs_length', []);

  for (let i = 1; i <= jobsLength; i++) {

    const job = await callStatic('get_job', [i]);

    applyArray.push({
      name: job.name,
      email: job.email,
      link: job.link,
      category: job.category,
      details: job.details,
    })
  }
  renderJobs();

  $("#loader").hide();
});