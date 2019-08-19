const contractSource = `
contract DevJobFinder =
  
  record job =
    { recuiterAddress : address,
      devType         : string,
      companyName     : string,
      jobDuration     : int,
      amount          : int,
      jobLocation     : string,
      skills          : string,
      description     : string }
  
  record applicant =
    { developerAddress : address,
      name             : string,
      email            : string,
      link             : string,
      category         : string,
      details          : string }
      
  record state =
    { jobs              : map(int, job),
      jobsLength        : int,
      applications      : map(int, applicant),
      applicationsLength: int }
      
  entrypoint init() =
    { jobs = {},
      jobsLength = 0,
      applications = {},
      applicationsLength = 0 }

  entrypoint get_jobs_length() : int =
    state.jobsLength
  
  entrypoint get_applications_length() : int =
    state.applicationsLength
      
  stateful entrypoint register_job(devType' : string, companyName' : string, jobDuration' : int, amount' : int, jobLocation' : string, skills' : string, description' : string) =
    let job = { recuiterAddress = Call.caller, devType = devType', companyName = companyName', jobDuration = jobDuration', amount = amount', jobLocation = jobLocation', skills = skills', description = description' }
    let index = get_jobs_length() + 1
    put(state{ jobs[index] = job, jobsLength = index })

  stateful entrypoint apply(name' : string, email' : string, link' : string, category' : string, details' : string) =
    let applicant = { developerAddress = Call.caller, name = name', email = email', link = link', category = category', details = details' }
    let index = get_applications_length() + 1
    put(state{ applications[index] = applicant, applicationsLength = index })

  entrypoint get_job(index : int) : job =
    switch(Map.lookup(index, state.jobs))
      None    => abort("There was no job with this index registered.")
      Some(x) => x

  entrypoint get_application(index : int) : applicant =
    switch(Map.lookup(index, state.applications))
      None    => abort("There was no application with this index registered.")
      Some(x) => x
`;

const contractAddress = 'ct_2MyEEeJgKyZy1t3Mp1gZkYK5Bw4ajMC3YB83JgjJd7SRhviFLB';
var client = null;
var applyArray = [];
var jobsArray = [];
var jobsLength = 0;

function renderJobs() {
  let template = $('#jobsJS').html();
  Mustache.parse(template);
  let rendered = Mustache.render(template, {jobsArray});
  $('#recentJobs').html(rendered);
}

async function callStatic(func, args) {
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  const calledGet = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));
  const decodedGet = await calledGet.decode().catch(e => console.error(e));

  return decodedGet;
}

async function contractCall(func, args, value) {
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  const calledSet = await contract.call(func, args, {amount: value}).catch(e => console.error(e));

  return calledSet;
}

window.addEventListener('load', async () => {
  $("#loader").show();

  client = await Ae.Aepp();

  jobsLength = await callStatic('get_jobs_length', []);

  for (let i = 1; i <= jobsLength; i++) {

    const job = await callStatic('get_job', [i]);

    jobsArray.push({
      devType: job.devType,
      companyName: job.companyName,
      jobDuration: job.jobDuration,
      amount: job.amount,
      jobLocation: job.jobLocation,
      skills: job.skills,
      description: job.description,
    })
  }
  renderJobs();

  $("#loader").hide();
});

$('#applicationBtn').click(async function(){
  $("#loader").show();
  const name = ($('#input-name').val()),
        email = ($('#input-email').val()),
        link = ($('#input-link').val()),
        category = ($('#input-jobRole').val()),
        details = ($('#input-aboutYourself').val());

  await contractCall('apply', [name, email, link, category, details], 0);

  applyArray.push({
    name: name,
    email: email,
    link: link,
    category: category,
    details: details,
  })

  $("#loader").hide();
});