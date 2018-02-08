var publicResolverInterval = null;

$(document).ready(function () {
    init();
    receiveInputData();
});

if (typeof web3 !== 'undefined') {
    window.web3 = new Web3(web3.currentProvider);
    console.log('current provider');
    console.log(web3.currentProvider);
} else {
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

function init() {
    $('#saveDomainHash').on('click', function () {
        saveDomainHash();
    });

    console.log(web3);
    publicResolverInterval = setInterval(function () {
        if (publicResolver) {
            clearInterval(publicResolverInterval);
            $('#saveDomainHash').removeClass('disabled');
        }
    }, 1000);
}

function receiveInputData() {
    var hash = window.location.hash.substring(1);
    var ensDomain = null;
    var swarmHash = null;
    if (hash) {
        hash = hash.split('/');
        if (hash.length === 2) {
            ensDomain = hash[0];
            swarmHash = hash[1];

            if (!isCorrectDomain(ensDomain) || !isCorrectSwarmHash(swarmHash)) {
                alert('Invalid domain or hash received');

                return;
            }

            $('#ensDomain').val(ensDomain);
            $('#swarmHash').val(swarmHash);
        }
    }
}

function isCorrectDomain(domain) {
    var minDomainLength = 3;

    return domain && domain.length >= minDomainLength;
}

function isCorrectSwarmHash(hash) {
    var hashLength = 64;

    return hash && hash.length === hashLength;
}

function saveDomainHash() {
    // theswarm.eth (namehash: 0x1f680e87e69e17c46be80a707cce1b86d726a716a671b540cb13eb57562c17c2) => resolver: 0x1da022710df5002339274aadee8d58218e9d6ab5 => content: 0x2c2d2adb8fd0cba399282fb59f8219e5fbbd67ba06fcf5c8d343f5eb1c8be022
    /*getContent('theswarm.eth', function (error, result) {
     if (error) {
     console.error('public resolver error: ' + error);
     }

     console.log('public resolver result: ' + result);
     });*/

    var ensDomain = $('#ensDomain').val();
    var swarmHash = $('#swarmHash').val();

    if (!isCorrectDomain(ensDomain) || !isCorrectSwarmHash(swarmHash)) {
        alert('Incorrect domain or hash');

        return;
    }

    getResolverContract(ensDomain, function (error, result) {
        if (error) {
            console.error('Empty resolver contract: ' + error);
        }

        console.log(result);
        if (error || !result) {

            alert('Resolver contract is empty. Try set up contract before changing content');
        } else {
            var domainNamehash = namehash(ensDomain);
            result.setContent(domainNamehash, swarmHash, function (error, result) {
                if (error) {
                    alert('Transaction rejected');
                    console.error(error);

                    return;
                }

                if (result) {
                    alert('Transaction complete. View transaction on Etherscan: <a href="https://etherscan.io/tx/' + result + '" target="_blank">' + result + '</a>');

                    console.log(result);
                }
            });
        }
    });
}

function alert(message) {
    $('#messageBody').html(message);
    $('#messageModal').modal('show');
}