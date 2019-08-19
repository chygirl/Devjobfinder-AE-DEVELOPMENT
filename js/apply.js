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