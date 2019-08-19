const jobsContractSource = `
  contract JobPortal =
    
    record job =
      { recuiterAddress : address,
        devType         : string,
        companyName     : string,
        jobDuration     : int,
        amount          : int,
        jobLocation     : string,
        skills          : string,
        description     : string }
        
    record state =
      { jobs      : map(int, job),
        jobsLength : int }
        
    entrypoint init() =
      { jobs = {},
        jobsLength = 0 }

    entrypoint get_jobs_length() : int =
      state.jobsLength
        
    stateful entrypoint register_job(devType' : string, companyName' : string, jobDuration' : int, amount' : int, jobLocation' : string, skills' : string, description' : string) =
      let job = { recuiterAddress = Call.caller, devType = devType', companyName = companyName', jobDuration = jobDuration', amount = amount', jobLocation = jobLocation', skills = skills', description = description' }
      let index = get_jobs_length() + 1
      put(state{ jobs[index] = job, jobsLength = index })

    entrypoint get_job(index : int) : job =
      switch(Map.lookup(index, state.jobs))
        None    => abort("There was no job with this index registered.")
        Some(x) => x
`;

const jobsContractAddress = 'ct_Lyf6EKFDUvNQmn7t7y6N1chnrsAAHMiPmTdgfLrUnp1zjULm8';
var client = null;
var jobsArray = [];
var jobsLength = 0;

function renderJobs() {
  let template = $('#jobsJS').html();
  Mustache.parse(template);
  let rendered = Mustache.render(template, {jobsArray});
  $('#recentJobs').html(rendered);
}

async function callStatic(func, args) {
  const contract = await client.getContractInstance(jobsContractSource, {jobsContractAddress});
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