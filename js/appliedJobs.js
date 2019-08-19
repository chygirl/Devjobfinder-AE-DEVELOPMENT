const contractSource = `
  contract ApplicationPortal =
    
    record applicant =
      { developerAddress : address,
        name             : string,
        email            : string,
        link             : string,
        category         : string,
        details          : string }
        
    record state =
      { applications       : map(int, applicant),
        applicationsLength : int }
        
    entrypoint init() =
      { applications = {},
        applicationsLength = 0 }
        
    entrypoint get_applications_length() : int =
      state.applicationsLength
        
    stateful entrypoint apply(name' : string, email' : string, link' : string, category' : string, details' : string) =
      let applicant = { developerAddress = Call.caller, name = name', email = email', link = link', category = category', details = details' }
      let index = get_applications_length() + 1
      put(state{ applications[index] = applicant, applicationsLength = index })
      
    entrypoint get_application(index : int) : applicant =
      switch(Map.lookup(index, state.applications))
        None    => abort("There was no application with this index registered.")
        Some(x) => x
`;

const contractAddress = 'ct_2oRWcRswdR8w2D6FkfJAQUF33LA1Kp2wzitpMyjuaGCTgUHpXd';
var client = null;
var applyArray = [];
var applicationsLength = 0;

function renderApplications() {
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

  applicationsLength = await callStatic('get_applications_length', []);

  for (let i = 1; i <= applicationsLength; i++) {

    const applicant = await callStatic('get_application', [i]);

    applyArray.push({
      name: applicant.name,
      email: applicant.email,
      link: applicant.link,
      category: applicant.category,
      details: applicant.details,
    })
  }
  renderApplications();

  $("#loader").hide();
});