const addJobContractSource = `
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

const addJobContractAddress = 'ct_4xDTTnKwQMvviFXvCFWDtBLJUyqhvFYkJ4egozzXtzVJPEQTf';
var client = null;
var jobsArray = [];

async function contractCall(func, args, value) {
  const contract = await client.getContractInstance(addJobContractSource, {addJobContractAddress});
  const calledSet = await contract.call(func, args, {amount: value}).catch(e => console.error(e));

  return calledSet;
}

window.addEventListener('load', async () => {
  client = await Ae.Aepp();
});

$('#addJobBtn').click(async function(){
  $("#loader").show();

  var devType = ($('#input-devType').val());
  var companyName = ($('#input-company').val());
  var jobDuration = ($('#input-jobDuration').val());
  var amount = ($('#input-amount').val());
  var jobLocation = ($('#input-location').val());
  var skills = ($('#input-skills').val());
  var description = ($('#input-jobDescripton').val());

  console.log("Developer Type: " + devType + ", Company Name: " + companyName + ", Job Duration: " + jobDuration + "years, Amount: " + amount + " AE, Job Location: " + jobLocation + ", Skills: " + skills + " and Job Description: " + description)

  await contractCall('register_job', [devType, companyName, jobDuration, amount, jobLocation, skills, description], 0);

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