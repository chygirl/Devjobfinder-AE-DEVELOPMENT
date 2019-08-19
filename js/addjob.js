const contractSource = `
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

const contractAddress = 'ct_Lyf6EKFDUvNQmn7t7y6N1chnrsAAHMiPmTdgfLrUnp1zjULm8';
var client = null;
var jobsArray = [];

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
  const devType = ($('#input-name').val()),
        companyName = ($('#input-email').val()),
        jobDuration = ($('#input-link').val()),
        amount = ($('#input-jobRole').val()),
        jobLocation = ($('#input-aboutYourself').val()),
        skills = ($('#input-jobRole').val()),
        description = ($('#input-jobRole').val());

  await contractCall('register_job', [devType, companyName, jobDuration, amount, jobLocation, skills, description]);

  jobsArray.push({
    devType: devType,
    companyName: companyName,
    jobDuration: jobDuration,
    amount: amount,
    jobLocation: jobLocation,
    skills: skills,
    description: description,
  })

  $("#loader").hide();
});