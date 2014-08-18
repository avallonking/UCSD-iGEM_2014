
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
    return plasmid_name, plasmid
    
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
    # iterate through operons
    for operon in plasmid:
        filename = plasmid_name + '_' + str(plasmid.index(operon)) + '.txt'
        pigeon = open(filename, 'w')
        # check directionality
        if operon['directionality'] == 'L':
            left(operon, pigeon)
        else:
            right(operon, pigeon)
    
        # end command
        pigeon.write('v\n# Arcs')
        pigeon.close()


# for left directionality
def left(operon, pigeon):
    # flip order of operons
    operon['components'].reverse()
    
    for component in operon['components']:
        # using randint to generate color -> temporary soln
        color1 = random.randint(0,13)
        color2 = random.randint(0,13)
        # if component is a cds
        if component[0] == 'c':
            # split multiple components into list
            double = re.split('_', component)
            if len(double) > 1:
                double.reverse()
                pigeon.write('<t\n<c ' + double[0] + ' %d\n<r\n<' % color1 +
                    double[1] + ' %d\n' % color2)
            else:
                pigeon.write('<t\n<' + component + ' %d\n' % color1)
        # if component is a promoter
        if component[0] == 'p':
            # split multiple components into list
            double = re.split('_', component)
            if len(double) > 1:
                double.reverse()
                pigeon.write('<r\n<p ' + double[0] + ' %d\n<' % color1 +
                    double[1] + ' %d\n' % color2)
            else:
                pigeon.write('<r\n<' + component + ' %d\n' % color1)


# for right directionality
def right(operon, pigeon):
    for component in operon['components']:
        # using randint to generate color -> temporary soln
        color1 = random.randint(0,13)
        color2 = random.randint(0,13)
        # if component is a cds
        if component[0] == 'c':
            # split multiple components into list
            double = re.split('_', component)
            if len(double) > 1:
                pigeon.write(double[0] + ' %d\nr\nc ' % color1 +
                    double[1] + ' %d\nt\n' % color2)
            else:
                pigeon.write(component + ' %d\nt\n' % color1)
        # if component is a promoter
        if component[0] == 'p':
            # check for multiple components
            double = re.split('_', component)
            if len(double) > 1:
                pigeon.write(double[0] + ' %d\np ' % color1 +
                    double[1] + ' %d\nr\n' % color2)
            else:
                pigeon.write(component + ' %d\nr\n' % color1)
make(*plasmid_to_operon_list(plasmid_name))