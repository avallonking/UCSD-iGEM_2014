
def plasmid_to_operon_list(plasmid_name):
    '''
    Returns a list of dictionaries containing information about the each operon
    '''
    #connect to sql
    plasmid_list = []
    plasmid_info = sql.execute('SELECT Operon_id, Directionality FROM POR WHERE Plasmid_id EQUALS' + plasmid_name)
    for item in plasmid_info:
        operon = operon_to_dict(*item)
        plasmid_list.append(operon)
    return plasmid
    
    #example plasmid
    #print plasmid --> [{operon1},{operon2},{operon3},..., operon{n}]
    
def operon_to_dict(operon_id, operon_direction = 'R'):
    '''
    Returns a single dictionary with information about an operon's directionality and components
    '''
    components_list = sql.execute('SELECT Components FROM OCR WHERE Operon_id EQUALS' + operon_id)    
    for component, i in components_list, len(components_list):
        #specifies if the given component is a promoter. Will have to change later to be careful about 
        #non-promoter components starting with a p.  
        if component[i][0] == 'p':
            component[i][0] = 'p', component[i][0]
        else:
            component[i][0] = 'c', component[i][0]
        component = ''.join(component)
    operon = {'directionality': operon_direction, 'components': components_list}
    return operon
    
    #example operon
    #print operon['components'] --> ['p plas','c luxR']
    #print operon['directionality'] --> 'R' or 'L'


# pigeon command generator

import re # import regular expression
import random


def make(plasmid):
    filename = plasmid_name + '.txt'
    pigeon = open(filename, 'w')
    # iterate through operons
    for operon in plasmid:
        # check directionality
        if operon['directionality'] == 'L':
            left(operon)
        else:
            right(operon)
    
    # end command
    pigeon.write('v\n# Arcs')
    pigeon.close()


# for left directionality
def left(operon, pigeon):
    # flip order of operons
    operon['components'].reverse()
    
    for component in operon['components']:
    # if component is a cds
        if component[0] == 'c':
        # split multiple components into list
            double = re.split('_', component)
            if len(double) > 1:
                double.reverse()
                # using randint to generate color -> temporary soln
                pigeon.write('<t\n<c' + double[0] + random.randint(0,13) +
                    '\n<r\n<' + double[1] + random.randint(0,13) + '\n')
            else:
                pigeon.write('<t\n<' + component + random.randint(0,13) + '\n')
        # if component is a promoter
        if component[0] == 'p':
            # split multiple components into list
            double = re.split('_', component)
            if len(double) > 1:
                double.reverse()
                # using randint to generate color -> temporary soln
                pigeon.write('<r\n<p' + double[0] + random.randint(0,13) +
                    '\n<' + double[1] + random.randint(0,13) + '\n')
            else:
                pigeon.write('<r\n<' + component + random.randint(0,13) + '\n')


# for right directionality
def right(operon, pigeon):
    for component in operon['components']:
        # if component is a cds
        if component[0] == 'c':
            # split multiple components into list
            double = re.split('_', component)
            if len(double) > 1:
                # using randint to generate color -> temporary soln
                pigeon.write(double[0] + random.randint(0,13) +
                    '\nr\nc' + double[1] + random.randint(0,13) + '\nt\n')
            else:
                pigeon.write(component + random.randint(0,13) + '\nt\n')
        # if component is a promoter
        if component[0] == 'p':
            # check for multiple components
            double = re.split('_', component)
            if len(double) > 1:
                # using randint to generate color -> temporary soln
                pigeon.write(double[0] + random.randint(0,13) +
                    '\np' + double[1] + random.randint(0,13) + '\nr\n')
            else:
                pigeon.write(component + random.randint(0,13) + '\nr\n')